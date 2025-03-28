## NSFW-SFW Image Classification using Vision Transformer

This project uses a pre-trained Vision Transformer (ViT) model for image classification.

---

## Dependencies

Install the required packages using:

```bash
pip install -r requirements.txt
```

If running on Google Colab, some packages may already be pre-installed.

---

## Frameworks Used

- **PyTorch**: Model training, optimization, and inference.
- **Torchvision**: Image dataset handling and transformations.
- **Transformers (Hugging Face)**: Loading and fine-tuning ViT.
- **Matplotlib**: Visualization of predictions.
- **Pillow (PIL)**: Image loading and processing.
- **Google Colab**: For training and storing models in Google Drive.
- **OS, Shutil, Zipfile, Glob, Math**: File management and processing.

---

## Usage

### 1. Clone the Repository

```bash
git clone https://github.com/Bhuvan66/NSFW_Content_Blocker.git
cd ML_Programs
```

### 2. Train the Model

Run the training script:

```bash
python train.py
```

This will:
- Extract and preprocess datasets
- Train the Vision Transformer (ViT) model
- Save the trained model in Google Drive

### 3. Perform classification

Run the "Main_usingTrainedModel.py" script to classify unseen images:

```bash
python /ML_Programs/imgModelBlocker/Main_usingTrainedModel.py
```

This will:
- Load the trained model
- Predict and display results for unseen images

---

## Model Details

- **Base Model**: Vision Transformer (ViT) `vit-base-patch16-224-in21k`
- **Training**: Fine-tuned for NSFW/SFW classification
- **Input Size**: 224x224 RGB images
- **Output Classes**: NSFW (0) / SFW (1)

---

## 4. Censorship in twitter

run the imgServerApp.py to get the censorship on nsfw content in "X" aka twitter

```bash
    cd NSFW_Content_Blocker/ML_Programs/
    python imgServerApp.py
```