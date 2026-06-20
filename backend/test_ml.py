from app.services.ml_service import (
    CLOSURE_MODEL_PATH,
    MODELS_DIR,
    PRIORITY_MODEL_PATH,
    predict_closure,
    predict_priority,
)

sample = {
    "event_type": "unplanned",
    "event_cause": "vehicle_breakdown",
    "veh_type": "truck",
    "latitude": 12.97,
    "longitude": 77.59,
}

print("Discovered model locations")
print(f"  models directory: {MODELS_DIR.resolve()}")
print(f"  priority model:   {PRIORITY_MODEL_PATH.resolve()}")
print(f"  closure model:    {CLOSURE_MODEL_PATH.resolve()}")
print()

print("Priority Prediction")
print(predict_priority(sample))
print()

print("Closure Prediction")
print(predict_closure(sample))
