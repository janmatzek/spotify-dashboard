import json
import logging
from enum import StrEnum
from typing import cast

from fastapi import APIRouter, Request, Response
from sqlmodel import Session, col, func, select

from src.db.db import Database
from src.db.schemas.top_artists import TopArtists
from src.db.schemas.top_genres import TopGenres
from src.db.schemas.track_data import Tracks
from src.db.schemas.tracks_average_utc import (
    TracksAverageUTC,
    TracksAverageUTCLast24,
)
from src.db.schemas.tracks_last_24_hours import TracksLast24Hours

charts = APIRouter(prefix="/charts", tags=["charts"])

logger = logging.getLogger(__name__)


class Period(StrEnum):
    """Enum to represent the period of time for the charts."""

    last_24 = "last_24"
    all_time = "all_time"


@charts.get("/scorecards/{period}")
async def get_scorecards_data(request: Request, period: Period) -> Response:
    """Returns data for scorecards - individual aggregated statistics."""
    db: Database = request.app.state.db
    queried_table: type[TracksLast24Hours] | type[Tracks]
    if period == Period.last_24:
        queried_table = TracksLast24Hours
    elif period == Period.all_time:
        queried_table = Tracks

    with Session(db.engine) as session:
        count_tracks = session.exec(
            select(func.count(col(queried_table.track_id)))
        ).first()
        distinct_tracks = session.exec(
            select(func.count(func.distinct(col(queried_table.track_id))))
        ).first()
        count_artists = session.exec(
            select(
                func.count(func.distinct(col(queried_table.track_artists_id)))
            )
        ).first()
        total_duration_ms = session.exec(
            select(func.sum(col(queried_table.track_duration_ms)))
        ).first()
        avg_popularity = session.exec(
            select(func.avg(col(queried_table.track_popularity)))
        ).first()

    data = {
        "count_tracks": count_tracks,
        "distinct_tracks": distinct_tracks,
        "count_artists": count_artists,
        "total_duration_ms": float(total_duration_ms)
        if total_duration_ms
        else 0,
        "avg_popularity": float(avg_popularity) if avg_popularity else 0,
    }

    return Response(
        content=json.dumps(data),
        status_code=200,
        headers={"Content-Type": "application/json"},
    )


@charts.get("/bars/{period}")
def get_bars_data(request: Request, period: Period) -> Response:
    """Returns data for the bar chart - tracks played per hour of day."""
    db: Database = request.app.state.db
    queried_table: type[TracksAverageUTC] | type[TracksAverageUTCLast24]

    if period == Period.last_24:
        queried_table = TracksAverageUTCLast24
    elif period == Period.all_time:
        queried_table = TracksAverageUTC

    with Session(db.engine) as session:
        query = select(queried_table)
        result = cast(
            list[TracksAverageUTC | TracksAverageUTCLast24],
            session.exec(query).all(),
        )

    data = [
        {"hour": row.hour_played_at, "count": int(row.track_count)}
        for row in result
    ]

    return Response(
        content=json.dumps(data),
        status_code=200,
        headers={"Content-Type": "application/json"},
    )


@charts.get("/pie_context/{period}")
def get_context_pie_data(request: Request, period: Period) -> Response:
    """Returns data for track context doughnut chart."""
    db: Database = request.app.state.db
    queried_table: type[TracksLast24Hours] | type[Tracks]

    if period == Period.last_24:
        queried_table = TracksLast24Hours
    elif period == Period.all_time:
        queried_table = Tracks

    with Session(db.engine) as session:
        query = (
            select(
                queried_table.context_type,
                func.count(col(queried_table.track_id).label("value")),
            )
            .group_by(queried_table.context_type)
            .order_by(func.count(col(queried_table.track_id)).desc())
        )

        result = session.exec(query).all()

    data = [
        {"category": category, "value": value} for category, value in result
    ]

    return Response(
        content=json.dumps(data),
        status_code=200,
        headers={"Content-Type": "application/json"},
    )


@charts.get("/pie_artists/{period}")
def get_artists_pie_data(request: Request, period: Period) -> Response:
    """Returns data for artists doughnut chart."""
    db: Database = request.app.state.db
    queried_table: type[TracksLast24Hours] | type[Tracks]

    if period == Period.last_24:
        queried_table = TracksLast24Hours
    elif period == Period.all_time:
        queried_table = Tracks

    with Session(db.engine) as session:
        query = (
            select(
                queried_table.track_artists_name,
                func.count(col(queried_table.track_id)).label("value"),
            )
            .group_by(queried_table.track_artists_name)
            .order_by(func.count(col(queried_table.track_id)).desc())
            .limit(20)
        )

        result = session.exec(query).all()

    data = [
        {"category": track_artists_id, "value": value}
        for track_artists_id, value in result
    ]

    return Response(
        content=json.dumps(data),
        status_code=200,
        headers={"Content-Type": "application/json"},
    )


@charts.get("/pie_release_years/{period}")
def get_release_pie_data(request: Request, period: Period) -> Response:
    """Returns data for release decades doughnut chart."""
    db: Database = request.app.state.db
    queried_table: type[TracksLast24Hours] | type[Tracks]

    if period == Period.last_24:
        queried_table = TracksLast24Hours
    elif period == Period.all_time:
        queried_table = Tracks

    decade_func = func.concat(
        func.substr(
            func.split_part(queried_table.track_album_release_date, "-", 1),
            1,
            3,
        ),
        "0s",
    )

    with Session(db.engine) as session:
        query = (
            select(
                decade_func.label("decade"),
                func.count(col(queried_table.track_id)).label("count"),
            )
            .group_by(decade_func)
            .order_by(func.count(col(queried_table.track_id)).desc())
            .limit(20)
        )
        result = session.exec(query).all()

    data = [{"category": decade, "value": count} for decade, count in result]

    return Response(
        content=json.dumps(data),
        status_code=200,
        headers={"Content-Type": "application/json"},
    )


@charts.get("/table/{period}")
def get_table_data(request: Request, period: Period) -> Response:
    """Returns data for the info table."""
    db: Database = request.app.state.db
    queried_table: type[TracksLast24Hours] | type[Tracks]

    if period == Period.last_24:
        queried_table = TracksLast24Hours
    elif period == Period.all_time:
        queried_table = Tracks

    with Session(db.engine) as session:
        query = (
            select(  # type: ignore # FIXME
                queried_table.track_album_images_url,
                queried_table.track_name,
                queried_table.track_album_name,
                queried_table.track_artists_name,
                func.concat(
                    "https://open.spotify.com/track/", queried_table.track_id
                ).label("track_url"),
            )
            .group_by(
                queried_table.track_id,
                queried_table.track_album_images_url,
                queried_table.track_name,
                queried_table.track_album_name,
                queried_table.track_artists_name,
            )
            .order_by(
                func.count(col(queried_table.track_id)).desc(),
                func.avg(col(queried_table.track_popularity)),
            )
            .limit(5)
        )
        result = session.exec(query).all()

    data = [
        {
            "album_image_url": album_image_url,
            "track_name": track_name,
            "album_name": album_name,
            "artist_name": artist_name,
            "track_url": track_url,
        }
        for album_image_url, track_name, album_name, artist_name, track_url in result
    ]

    return Response(
        content=json.dumps(data),
        status_code=200,
        headers={"Content-Type": "application/json"},
    )


@charts.get("/favorite_artists")
def get_favorite_artists(request: Request) -> Response:
    """Returns data for top 5 artists."""
    db: Database = request.app.state.db
    with Session(db.engine) as session:
        query = select(TopArtists)
        result = session.exec(query).all()

    data = [
        {
            "name": artist.name,
            "main_genre": artist.main_genre,
            "genres": artist.genres,
            "popularity": artist.popularity,
            "images_url": artist.images_url,
            "external_urls_spotify": artist.external_urls_spotify,
            "count_tracks": artist.count_tracks,
        }
        for artist in result
    ]

    return Response(
        content=json.dumps(data),
        status_code=200,
        headers={"Content-Type": "application/json"},
    )


@charts.get("/favorite_genres")
def get_favorite_genres(request: Request) -> Response:
    """Returns data for top 20 genres."""
    with Session(request.app.state.db.engine) as session:
        query = select(TopGenres.genre, TopGenres.count_tracks).limit(20)
        result = session.exec(query).all()

    data = [
        {"genre": genre, "count_tracks": count_tracks}
        for genre, count_tracks in result
    ]

    return Response(
        content=json.dumps(data),
        status_code=200,
        headers={"Content-Type": "application/json"},
    )
