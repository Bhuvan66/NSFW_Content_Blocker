# aftewt reading this, pls go here "ML_Programs\imgModelBlocker\ReadMe.txt" . i have explained stuffs in detail.
# btw this is not server.

import matplotlib.pyplot as plt
from torchvision import transforms
from transformers import ViTForImageClassification, ViTConfig
from PIL import Image
import torch
import glob
import math


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

#loading the img wch r meant to see whether the predictions r crect or not
# unseenPath = "/content/drive/MyDrive/unseen1"
unseenPath = "C:\\Users\\ASUS\\Desktop\\sideQuest\\ML_Programs\\imgModelBlocker\\unseen1"
imagePaths = glob.glob(unseenPath + "/*.jpg")

#makin grid
num_images = len(imagePaths)
cols = 5  #no. of clms
rows = math.ceil(num_images / cols)  #no of rows based on imges
#more in grd
fig, axes = plt.subplots(rows, cols, figsize=(15, rows * 3))
axes = axes.flatten()


for i, imgPath in enumerate(imagePaths):
    img = Image.open(imgPath).convert("RGB") #it ensures img is rgb else converts
    transformed_img = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(transformed_img)  # img sent to trained model
        prediction = torch.argmax(output.logits, dim=1).item()  #gettin predicted class(here we get probablity of both class of img and picks the class with highest prob)
        label = "NSFW" if prediction == 0 else "SFW"  #asignin labela

    #showwin imgs
    axes[i].imshow(img)
    axes[i].set_title(f"Predicted: {label}", fontsize=12)
    axes[i].axis("off")

#just hides unused sub spaces in plot
for j in range(i + 1, len(axes)):
    axes[j].axis("off")

#this just ads padding around img so to look cool and fit in subplot
plt.tight_layout()
plt.show()