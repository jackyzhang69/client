""" An abstract class for solutions"""

from abc import abstractmethod
from pydantic import BaseModel


class Solutions(BaseModel):
    @abstractmethod
    def show(self, **kwargs):
        pass
