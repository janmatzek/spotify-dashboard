# 🎵 Spotify Dashboard

Analytics dashboard for your Spotify listening history. Track your favorite artists, discover genre trends, and gain insights into your music preferences.

**Note**: The Spotify API does not support podcast data.

## Features

- **Listening Statistics**: Detailed metrics about your music consumption
- **Top Artists**: Track your most-listened-to artists over time
- **Genre Analysis**: Discover your genre preferences with interactive charts
- **Time-Based Insights**: View listening patterns by day, week, and month

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Spotify Developer Account

### Development

1. **Get Spotify Credentials**

   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create an app and note your Client ID and Client Secret
   - Generate a refresh token

2. **Configure**

   ```bash
   cp env.example .env
   # Edit .env with your Spotify credentials
   ```

3. **Run**

   ```bash
   make dev
   ```

### Production

1. **Setup Secrets**

   ```bash
   make secrets
   ```

2. **Deploy**

   ```bash
   make prod
   ```
