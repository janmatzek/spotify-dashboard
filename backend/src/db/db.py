import importlib
import inspect
import pkgutil

from sqlalchemy.engine import Engine
from sqlmodel import (
    SQLModel,
    create_engine,
)

from src.db.queries import Queries
from src.utils.logging import get_logger

logger = get_logger(__name__)


class Database:
    """Class to handle database operations."""

    def __init__(self, connection_string: str) -> None:
        self.client = None
        self.connection_string = connection_string

        self.engine: Engine = create_engine(
            self.connection_string, echo=False, future=True
        )
        self.models = self.import_all_models()
        self.queries = Queries(self)

        # Creates all tables in the database based on the imported models
        SQLModel.metadata.create_all(self.engine)

    def import_all_models(self) -> dict[str, type[SQLModel]]:
        """
        Dynamically imports all SQLModel subclasses from the db.schemas.

        Returns:
            A dictionary where keys are model names and values are the
                corresponding SQLModel subclasses.
        """

        import src.db.schemas as schemas

        models = {}
        package_path = schemas.__path__
        for _, module_name, _ in pkgutil.iter_modules(package_path):
            module = importlib.import_module(f"src.db.schemas.{module_name}")
            # Collect all SQLModel subclasses from the module
            for name, obj in inspect.getmembers(module):
                if (
                    inspect.isclass(obj)
                    and issubclass(obj, SQLModel)
                    and obj is not SQLModel
                ):
                    models[name] = obj
                    logger.info(f"Imported model: {name}")
        return models
