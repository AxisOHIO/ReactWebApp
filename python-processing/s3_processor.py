#import numpy as np
import pandas as pd

num_rows = 1500

# Random dates over a week
dates = pd.date_range(start='2025-10-25', periods=40, freq='D')
timestamps = np.random.choice(dates, size=num_rows) + pd.to_timedelta(np.random.randint(0, 24*60*60, size=num_rows), unit='s')

# Random pitch and roll in degrees (example ranges)
pitch = np.random.normal(0, 9, size=num_rows)
roll = np.random.normal(0, 8, size=num_rows)

df = pd.DataFrame({
    'timestamp': timestamps,
    'pitch': pitch,
    'roll': roll
})

def compute_posture(row):
    if (row['pitch'] < -12) or (row['roll'] < -10) or (row['roll'] > 10):
        return 'bad'
    else:
        return 'good'

df['postureState'] = df.apply(compute_posture, axis=1)

def classify_bad_cause(row):
    if row['postureState'] == 'good':
        return ''  # or np.nan if you prefer
    bad_pitch = row['pitch'] < -12
    bad_roll = (row['roll'] < -10) or (row['roll'] > 10)
    
    if bad_pitch and bad_roll:
        return 'both'
    elif bad_pitch:
        return 'pitch'
    elif bad_roll:
        return 'roll'
    else:
        return 'unknown'  # should not occur with current rules

df['bad_cause'] = df.apply(classify_bad_cause, axis=1)


df = df.sort_values('timestamp').reset_index(drop=True)

#df.head(20)

#df.describe()

#df['postureState'].value_counts()

# Make sure the timestamp column is a datetime type
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Create a new column with only the date (no time)
df['date'] = df['timestamp'].dt.date

# Check the result
#df.head(10)

pivot = df.pivot_table(index='date', columns='postureState', aggfunc='size', fill_value=0)
#print(pivot)

percent = pivot.div(pivot.sum(axis=1), axis=0) * 100
percent = percent.round(3)
#print(percent)

#pivot.plot(kind='bar', stacked=False, figsize=(10,5))

# Compute basic stats
summary_df = df.groupby('date').agg(
    pitch_mean=('pitch', 'mean'),
    pitch_std=('pitch', 'std'),
    pitch_min=('pitch', 'min'),
    pitch_max=('pitch', 'max'),
    roll_mean=('roll', 'mean'),
    roll_std=('roll', 'std'),
    roll_min=('roll', 'min'),
    roll_max=('roll', 'max')
).reset_index()

summary_df.head(10)

# Count of good/bad per day
posture_counts = df.groupby(['date', 'postureState']).size().unstack(fill_value=0)

# Compute percentages
posture_percent = posture_counts.div(posture_counts.sum(axis=1), axis=0) * 100
posture_percent = posture_percent.rename(columns={
    'good': 'percent_good',
    'bad': 'percent_bad'
}).reset_index()

# Optional: round percentages to 2 decimals
posture_percent['percent_good'] = posture_percent['percent_good'].round(2)
posture_percent['percent_bad'] = posture_percent['percent_bad'].round(2)
summary_df = summary_df.merge(posture_percent, on='date')

# Filter only bad posture rows
bad_df = df[df['postureState'] == 'bad']

# Count occurrences of each bad_cause per day
cause_counts = bad_df.groupby(['date', 'bad_cause']).size().unstack(fill_value=0)

# Ensure all possible columns exist
for col in ['pitch', 'roll', 'both']:
    if col not in cause_counts.columns:
        cause_counts[col] = 0

# Compute percentages relative to total bad posture counts per day
cause_percent = cause_counts.div(cause_counts.sum(axis=1), axis=0) * 100

# Round to 2 decimals
cause_percent = cause_percent[['pitch','roll','both']].round(2)

# Rename columns for clarity
cause_percent = cause_percent.rename(columns={
    'pitch':'percent_bad_pitch',
    'roll':'percent_bad_roll',
    'both':'percent_bad_both'
}).reset_index()

#cause_percent.head()

# Ensure all columns exist in cause_percent
for col in ['percent_bad_pitch', 'percent_bad_roll', 'percent_bad_both']:
    if col in summary_df.columns:
        summary_df.drop(columns=col, inplace=True)


summary_df = summary_df.merge(cause_percent, on='date', how='left')
summary_df[['percent_bad_pitch','percent_bad_roll','percent_bad_both']] = summary_df[['percent_bad_pitch','percent_bad_roll','percent_bad_both']].fillna(0)
#summary_df.head(10)

# Drop existing total_count if it exists
if 'total_count' in summary_df.columns:
    summary_df.drop(columns='total_count', inplace=True)

# Now merge safely
daily_counts = df.groupby('date').size().reset_index(name='total_count')
summary_df = summary_df.merge(daily_counts, on='date', how='left')
summary_df['total_count'] = summary_df['total_count'].fillna(0).astype(int)
#summary_df.head(10)

# Example: percent_good scaled 0-1
# steepness controls how much the mid-range (45-55%) is emphasized
steepness = 10  

# normalize percent_good to 0-1
p = summary_df['percent_good'] / 100.0

# scaled logistic mapping for mid-range emphasis
L = 1 / (1 + np.exp(-steepness * (p - 0.5)))

# normalize so that 0->0 and 1->1
L0 = 1 / (1 + np.exp(-steepness * (0.0 - 0.5)))
L1 = 1 / (1 + np.exp(-steepness * (1.0 - 0.5)))

# compute score_good and clip to [0,1]
summary_df['score_percent_good'] = np.clip((L - L0) / (L1 - L0), 0, 1)
# add a small offset, e.g., 0.05, and clip at 1
summary_df['score_percent_good'] = np.clip(summary_df['score_percent_good'] + (0.06 * (1 - summary_df['percent_good']/100) * (1 - summary_df['percent_good']/100)), 0, 1)

# Variance/STD can be inverted so lower variance is better
import numpy as np

# --- Parameters for thresholds ---
pitch_var_good = 7.0
pitch_var_bad  = 12.0
roll_var_good  = 6.0
roll_var_bad   = 11.0

pitch_mean_good = 0.4
pitch_mean_bad  = 3.0
roll_mean_good  = 0.2
roll_mean_bad   = 2.5

# --- Variance scoring (0-1, fixed thresholds) ---
# pitch variance
score_var_pitch = np.ones_like(summary_df['pitch_std'].values, dtype=float)
mask_low = summary_df['pitch_std'] <= pitch_var_good
mask_high = summary_df['pitch_std'] >= pitch_var_bad
mask_mid = (~mask_low) & (~mask_high)
score_var_pitch[mask_low] = 1.0
score_var_pitch[mask_high] = 0.0
score_var_pitch[mask_mid] = 1.0 - (summary_df['pitch_std'][mask_mid] - pitch_var_good) / (pitch_var_bad - pitch_var_good)

# roll variance
score_var_roll = np.ones_like(summary_df['roll_std'].values, dtype=float)
mask_low = summary_df['roll_std'] <= roll_var_good
mask_high = summary_df['roll_std'] >= roll_var_bad
mask_mid = (~mask_low) & (~mask_high)
score_var_roll[mask_low] = 1.0
score_var_roll[mask_high] = 0.0
score_var_roll[mask_mid] = 1.0 - (summary_df['roll_std'][mask_mid] - roll_var_good) / (roll_var_bad - roll_var_good)

# combine variance scores
summary_df['score_pitch_var'] = score_var_pitch
summary_df['score_roll_var'] = score_var_roll

# --- Mean scoring (0-1, absolute deviation, fixed thresholds) ---
# pitch mean
score_mean_pitch = np.ones_like(summary_df['pitch_mean'].values, dtype=float)
abs_pitch_mean = np.abs(summary_df['pitch_mean'])
mask_low = abs_pitch_mean <= pitch_mean_good
mask_high = abs_pitch_mean >= pitch_mean_bad
mask_mid = (~mask_low) & (~mask_high)
score_mean_pitch[mask_low] = 1.0
score_mean_pitch[mask_high] = 0.0
score_mean_pitch[mask_mid] = 1.0 - (abs_pitch_mean[mask_mid] - pitch_mean_good) / (pitch_mean_bad - pitch_mean_good)

# roll mean
score_mean_roll = np.ones_like(summary_df['roll_mean'].values, dtype=float)
abs_roll_mean = np.abs(summary_df['roll_mean'])
mask_low = abs_roll_mean <= roll_mean_good
mask_high = abs_roll_mean >= roll_mean_bad
mask_mid = (~mask_low) & (~mask_high)
score_mean_roll[mask_low] = 1.0
score_mean_roll[mask_high] = 0.0
score_mean_roll[mask_mid] = 1.0 - (abs_roll_mean[mask_mid] - roll_mean_good) / (roll_mean_bad - roll_mean_good)

# combine mean scores
#summary_df['score_mean'] = 0.5 * (score_mean_pitch + score_mean_roll)
summary_df['score_pitch_mean'] = score_mean_pitch
summary_df['score_roll_mean'] = score_mean_roll



# Percent of bad caused by "both" could reduce score
summary_df['score_bad_both'] = 1 - (summary_df['percent_bad_both'] / 100)
#summary_df.head(10)

# Example weights (adjust as needed)
w_good = 0.65
w_var = 0.12  # combined pitch + roll variance
w_mean = 0.15
w_bad_cause = 0.08

summary_df['posture_score_raw'] = (
    w_good * summary_df['score_percent_good'] +
    w_var * 0.5 * (summary_df['score_pitch_var'] + summary_df['score_roll_var']) +
    w_bad_cause * summary_df['score_bad_both'] + 
    w_mean * 0.5 * (summary_df['score_pitch_mean'] + summary_df['score_roll_mean'])
)

summary_df['posture_score'] = (summary_df['posture_score_raw'] * 9 + 1).round(2)

#THIS HERE IS THE FUNCTION THE WEBSITE CALLS
#THE WEBSITE NEEDS RADIO BUTTON INPUT FROM THE USER
#BASED ON THE INPUT, THE FUNCTION WILL RETURN A DIFFERENT GRAPH

import matplotlib.pyplot as plt
import numpy as np

def plot_posture_data_grouped(timeframe=7, plot_type=True, return_image=False):
    global summary_df
    df = summary_df.sort_values('date').tail(timeframe)
    
    # New color scheme
    color_good = '#f39c12'   # orange
    color_bad  = '#3498db'   # blue
    color_pitch = '#f39c12'   # orange
    color_roll  = '#3498db'   # blue
    color_both  = '#9b59b6'   # purple (keeps contrast)



    # Explicit numeric positions for bars
    dates = np.arange(len(df))
    num_entries = len(df)
    num_days = 1
    width = 0.35
    if timeframe == 7 and plot_type == False:
        if(num_entries >= 7):
            width = 0.25
            num_days = 7
        else:
            width = 0.33 - num_entries * 0.01
            num_days = num_entries
    elif timeframe == 7:
        if(num_entries >= 7):
            width = 0.25
            num_days = 7
        else:
            width = 0.33 - num_entries * 0.01
            num_days = num_entries
    elif timeframe == 30 and plot_type:
        if(num_entries >= 30):
            width = 0.25
            num_days = 30
        else:
            width = 0.55 - num_entries * 0.01
            num_days = num_entries
    elif timeframe  == 30 and plot_type == False:
        if(num_entries >= 30):
            width = 0.25
            num_days = 30
        else:
            width = 0.55 - num_entries * 0.01
            num_days = num_entries

    fig, ax = plt.subplots(figsize=(10,5))

    if plot_type:
        # Side-by-side bars for Good and Bad
        ax.bar(dates - width/2, df['percent_good'], width, label='Good Posture', color=color_good, alpha=0.7)
        ax.bar(dates + width/2, df['percent_bad'], width, label='Bad Posture', color=color_bad, alpha=0.7)
        ax.axhline(y=70, color='red', linestyle='-', linewidth=2, label='Target (70%)')
        ax.set_ylabel('Percentage (%)')
        if timeframe == 1:
            ax.set_title(f'Good vs Bad Posture over the Last Day')
        else:
            ax.set_title(f'Good vs Bad Posture — Last {num_days} Days')

    else:
        # Side-by-side bars for Pitch / Roll / Both
        ax.bar(dates - width, df['percent_bad_pitch'], width, label='Pitch', color=color_pitch, alpha=0.7)
        ax.bar(dates, df['percent_bad_roll'], width, label='Roll', color=color_roll, alpha=0.7)
        ax.bar(dates + width, df['percent_bad_both'], width, label='Both', color=color_both, alpha=0.7)
        ax.set_ylabel('Percentage of Bad Posture (%)')
        if timeframe == 1:
            ax.set_title(f'Good vs Bad Posture over the Last Day')
        else:
            ax.set_title(f'Good vs Bad Posture — Last {num_days} Days')

    # Clean up axis
    ax.set_xticks(dates)
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    ax.set_xticklabels(df['date'].dt.strftime('%Y-%m-%d'), rotation=90)
    ax.set_xlabel('Date')
    ax.legend()
    plt.tight_layout()

    if return_image:
        import io
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        plt.close(fig)
        return buf
    else:
        plt.show()
        return fig

    

    # Plot 1 — Good/Bad distribution for last 7 days
    #plot_posture_data_grouped(7, True, False)

    # Plot 2 — Pitch/Roll/Both cause of bad posture for last day
    #plot_posture_data_grouped(1, False, False)





