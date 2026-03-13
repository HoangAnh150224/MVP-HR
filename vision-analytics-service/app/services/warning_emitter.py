from app.models.signals import SignalSnapshot
from app.models.warnings import Warning


class WarningEmitter:
    THRESHOLDS = {
        "eye_contact": {"warning": 0.3, "critical": 0.15},
        "head_yaw": {"warning": 25.0, "critical": 40.0},
    }

    def evaluate(self, signals: SignalSnapshot) -> list[Warning]:
        warnings: list[Warning] = []

        if signals.eye_contact_score < self.THRESHOLDS["eye_contact"]["critical"]:
            warnings.append(
                Warning(
                    type="eye_contact",
                    severity="critical",
                    message="Hãy nhìn vào camera để duy trì giao tiếp bằng mắt",
                    value=signals.eye_contact_score,
                    threshold=self.THRESHOLDS["eye_contact"]["critical"],
                )
            )
        elif signals.eye_contact_score < self.THRESHOLDS["eye_contact"]["warning"]:
            warnings.append(
                Warning(
                    type="eye_contact",
                    severity="warning",
                    message="Cố gắng duy trì giao tiếp bằng mắt với camera",
                    value=signals.eye_contact_score,
                    threshold=self.THRESHOLDS["eye_contact"]["warning"],
                )
            )

        if abs(signals.head_yaw) > self.THRESHOLDS["head_yaw"]["critical"]:
            warnings.append(
                Warning(
                    type="posture",
                    severity="critical",
                    message="Hãy quay mặt về phía camera",
                    value=abs(signals.head_yaw),
                    threshold=self.THRESHOLDS["head_yaw"]["critical"],
                )
            )

        # Expression warnings (only when blendshapes are available)
        if signals.emotion_scores:
            scores = signals.emotion_scores
            if scores.get("concerned", 0) >= 0.65:
                warnings.append(
                    Warning(
                        type="expression",
                        severity="warning",
                        message="Hãy thư giãn, cố gắng tự tin hơn",
                        value=scores["concerned"],
                        threshold=0.65,
                    )
                )
            elif scores.get("confused", 0) >= 0.65:
                warnings.append(
                    Warning(
                        type="expression",
                        severity="warning",
                        message="Nếu chưa hiểu câu hỏi, hãy hỏi lại nhà tuyển dụng",
                        value=scores["confused"],
                        threshold=0.65,
                    )
                )
            elif scores.get("neutral", 0) >= 0.85:
                warnings.append(
                    Warning(
                        type="expression",
                        severity="warning",
                        message="Cố gắng mỉm cười và thể hiện sự nhiệt tình",
                        value=scores["neutral"],
                        threshold=0.85,
                    )
                )

        return warnings
