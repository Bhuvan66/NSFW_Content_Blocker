#imSoYVL

from flask import Flask, request, jsonify
import torch
from torchvision import transforms
from transformers import ViTForImageClassification, ViTConfig
from PIL import Image
import io

app = Flask(__name__)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

#Loadin model architecture same as the trainin one
config = ViTConfig.from_pretrained("google/vit-base-patch16-224-in21k", num_labels=2)
model = ViTForImageClassification(config)

#loadin trained model
# model_path = "/content/drive/MyDrive/trainedModelTrial1.pth"
model_path = "C:\\Users\\ASUS\\Desktop\\sideQuest\\ML_Programs\\imgModelBlocker\\trainedModelTrial1.pth"

model.load_state_dict(torch.load(model_path, map_location=device))
model.to(device)
model.eval()

# here img is converted to 224x224 resln as  vit prefers it
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(), #converting img to numerical format
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),#these values make pxl to be in range of -1 to 1 instead of 0-1
])

@app.route('/predict', methods=['POST'])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No img provided."}), 400

    image_file = request.files['image']
    image = Image.open(io.BytesIO(image_file.read())).convert("RGB")#it ensures img is rgb else converts
    
    # Transform image
    transformed_img = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(transformed_img) # img sent to trained model
        prediction = torch.argmax(output.logits, dim=1).item()  #gettin predicted class(here we get probablity of both class of img and picks the class with highest prob)
        label = -1 if prediction == 0 else 1  #asignin labela (iam sendin -1 and 1 wr -1 means nsfw and 1 sfw)

    return jsonify({'prediction': label})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
