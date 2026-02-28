from collections import deque

from app.models.signals import SignalSnapshot


class RollingWindow:
    def __init__(self, max_size: int = 30):
        self._buffer: deque[SignalSnapshot] = deque(maxlen=max_size)

    def add(self, snapshot: SignalSnapshot) -> None:
        self._buffer.append(snapshot)

    @property
    def eye_contact_avg(self) -> float:
        if not self._buffer:
            return 0.0
        return sum(s.eye_contact_score for s in self._buffer) / len(self._buffer)

    @property
    def blink_rate(self) -> float:
        # TODO: Compute blinks per minute from recent frames
        return 15.0
