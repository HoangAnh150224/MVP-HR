from pydantic import BaseModel


class Warning(BaseModel):
    type: str
    severity: str
    message: str
    value: float
    threshold: float
