# Human Face Recognition: FaceID

`faceid` runs multiple checks to validate webcam input before performing face match  
Detected face image and descriptor are stored in client-side IndexDB  

## Workflow
- Starts webcam  
- Waits until input video contains validated face or timeout is reached  
  - Number of people
  - Face size
  - Face and gaze direction
  - Detection scores
  - Blink detection (including temporal check for blink speed) to verify live input
  - Runs `antispoofing` optional module
  - Runs `liveness` optional module
- Runs match against database of registered faces and presents best match with scores

## Notes

Both `antispoof` and `liveness` models are tiny and
designed to serve as a quick check when used together with other indicators:
- size below 1MB
- very quick inference times as they are very simple (11 ops for antispoof and 23 ops for liveness)
- trained on low-resolution inputs

### Anti-spoofing Module
- Checks if input is realistic (e.g. computer generated faces)
- Configuration: `human.config.face.antispoof`.enabled
- Result: `human.result.face[0].real` as score

### Liveness Module
- Checks if input has obvious artifacts due to recording (e.g. playing back phone recording of a face)
- Configuration: `human.config.face.liveness`.enabled
- Result: `human.result.face[0].live` as score

### Models

**FaceID** is compatible with
- `faceres.json` (default) perfoms combined age/gender/descriptor analysis
- `faceres-deep.json` higher resolution variation of `faceres`
- `mobilefacenet` alternative model for face descriptor analysis
