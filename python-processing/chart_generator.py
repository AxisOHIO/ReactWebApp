import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import base64
import io
import json
import sys

# Generate sample data to match the existing processing
num_rows = 1500
dates = pd.date_range(start='2025-10-25', periods=40, freq='D')
timestamps = np.random.choice(dates, size=num_rows) + pd.to_timedelta(np.random.randint(0, 24*60*60, size=num_rows), unit='s')

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
        return ''
    bad_pitch = row['pitch'] < -12
    bad_roll = (row['roll'] < -10) or (row['roll'] > 10)
    
    if bad_pitch and bad_roll:
        return 'both'
    elif bad_pitch:
        return 'pitch'
    elif bad_roll:
        return 'roll'
    else:
        return 'unknown'

df['bad_cause'] = df.apply(classify_bad_cause, axis=1)
df = df.sort_values('timestamp').reset_index(drop=True)
df['timestamp'] = pd.to_datetime(df['timestamp'])
df['date'] = df['timestamp'].dt.date

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

# Count of good/bad per day
posture_counts = df.groupby(['date', 'postureState']).size().unstack(fill_value=0)
posture_percent = posture_counts.div(posture_counts.sum(axis=1), axis=0) * 100
posture_percent = posture_percent.rename(columns={
    'good': 'percent_good',
    'bad': 'percent_bad'
}).reset_index()

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
cause_percent = cause_percent[['pitch','roll','both']].round(2)
cause_percent = cause_percent.rename(columns={
    'pitch':'percent_bad_pitch',
    'roll':'percent_bad_roll',
    'both':'percent_bad_both'
}).reset_index()

summary_df = summary_df.merge(cause_percent, on='date', how='left')
summary_df[['percent_bad_pitch','percent_bad_roll','percent_bad_both']] = summary_df[['percent_bad_pitch','percent_bad_roll','percent_bad_both']].fillna(0)

def plot_posture_data_grouped(timeframe=7, plot_type=True, return_image=False):
    global summary_df
    df_plot = summary_df.sort_values('date').tail(timeframe)
    
    # New color scheme
    color_good = '#f39c12'   # orange
    color_bad  = '#3498db'   # blue
    color_pitch = '#f39c12'   # orange
    color_roll  = '#3498db'   # blue
    color_both  = '#9b59b6'   # purple (keeps contrast)

    # Explicit numeric positions for bars
    dates = np.arange(len(df_plot))
    num_entries = len(df_plot)
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

    # Set dark theme styling to match dashboard
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(10,5), facecolor='none')
    ax.set_facecolor('none')

    if plot_type:
        # Side-by-side bars for Good and Bad
        ax.bar(dates - width/2, df_plot['percent_good'], width, label='Good Posture', color=color_good, alpha=0.7)
        ax.bar(dates + width/2, df_plot['percent_bad'], width, label='Bad Posture', color=color_bad, alpha=0.7)
        ax.axhline(y=70, color='red', linestyle='-', linewidth=2, label='Target (70%)')
        ax.set_ylabel('Percentage (%)')
        if timeframe == 1:
            ax.set_title(f'Good vs Bad Posture over the Last Day')
        else:
            ax.set_title(f'Good vs Bad Posture — Last {num_days} Days')

    else:
        # Side-by-side bars for Pitch / Roll / Both
        ax.bar(dates - width, df_plot['percent_bad_pitch'], width, label='Pitch', color=color_pitch, alpha=0.7)
        ax.bar(dates, df_plot['percent_bad_roll'], width, label='Roll', color=color_roll, alpha=0.7)
        ax.bar(dates + width, df_plot['percent_bad_both'], width, label='Both', color=color_both, alpha=0.7)
        ax.set_ylabel('Percentage of Bad Posture (%)')
        if timeframe == 1:
            ax.set_title(f'Bad Posture Causes over the Last Day')
        else:
            ax.set_title(f'Bad Posture Causes — Last {num_days} Days')

    # Clean up axis with white text
    ax.set_xticks(dates)
    df_plot['date'] = pd.to_datetime(df_plot['date'], errors='coerce')
    ax.set_xticklabels(df_plot['date'].dt.strftime('%Y-%m-%d'), rotation=90, color='white')
    ax.set_xlabel('Date', color='white')
    ax.set_ylabel(ax.get_ylabel(), color='white')
    ax.set_title(ax.get_title(), color='white')
    
    # Style ticks and grid
    ax.tick_params(colors='white')
    ax.grid(True, alpha=0.2, color='white')
    ax.spines['bottom'].set_color('white')
    ax.spines['top'].set_color('white')
    ax.spines['right'].set_color('white')
    ax.spines['left'].set_color('white')
    
    # Style legend
    legend = ax.legend()
    legend.get_frame().set_facecolor('none')
    legend.get_frame().set_edgecolor('white')
    for text in legend.get_texts():
        text.set_color('white')
    
    plt.tight_layout()

    if return_image:
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        plt.close(fig)
        return buf
    else:
        plt.show()
        return fig

if __name__ == "__main__":
    timeframe = int(sys.argv[1]) if len(sys.argv) > 1 else 7
    plot_type = sys.argv[2].lower() == 'true' if len(sys.argv) > 2 else True
    
    buf = plot_posture_data_grouped(timeframe, plot_type, return_image=True)
    image_data = base64.b64encode(buf.getvalue()).decode()
    result = {"image": image_data}
    print(json.dumps(result))