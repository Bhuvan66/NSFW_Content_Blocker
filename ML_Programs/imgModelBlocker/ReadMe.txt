NOTE: SRY FOR LOT OF ABBREVIATIONS and GRAMATICAL ISSUES :P

aim : classify image as as NSFW and SFW
img processing tool : vision transformer
pre-trained ViT model  google/vit-base-patch16-224-in21k

working
~for transformation
	image is ensured that its in rgb format
	after that ViT img processor resizes the img resln to 224x224 and normalises the pxl values
how imgs r classified
	so images are broken to 16x16 patches and sends to transformation layer. In there, layer tried to understand the pattern and relationship between patches

code implementation
	loads dataset like some r in zip format and combines it making a 2 label class.
	then it loads the pre-trained model ViT with 2 class type
	checking whether GPU is available for faster computation

TRANSFORMATION of IMG  wch is going to be input for ViT model
	1. it ensures img is in rgb mode (reason is, vit expects it to be in rgb format)
	2. 
		def transform_fn(image):
	        encoding = processor(image, return_tensors="pt")
	        return encoding["pixel_values"].squeeze(0)

	    - here processor is an instance of ViTImageProcessor.from_pretrained("google/vit-base-patch16-224-in21k"), wch handles the preprocessing specific to the ViT model.
		- what it does iS reisize the img to 224*224 pxl so it can be make 16x16 patches
	    - center cropping is applied.
	    - normalises the pxl value by applying mean and std deviation
	    ==return_tensors="pt"== argument ensures the output is a PyTorch tensor, and ==squeeze(0)== removes any batch dimension
	    basically above 2 lines makes a tensor such a way that the model can accept it
	    
Note:the transformation pipeline does not include data augmentations like random cropping, flipping, or rotation, wch are often used in training to improve model robustness.

MECHANISM
	- patch embedding
		after transformation of image, the image is divided into non overlapping 16x16 patches. basically dividing 224x224 img into 196 patches.
		Each patch is flattened into a vector and linearly embedded into a higher-dimensional space
	-positional encodding
		similar to the text in transformation. (refer transformation video for better understanding)
	-Transformer Encoder Processing
		so basically , as class tokens will  be attached to the embedded patches, passed down to multiple transformation layers wch basically is self-attention(transformation main wrking again refer video)  wch helps in determining the complex relationship and pattern.
		At the end layer, the cls tokens helps in identifying the img wch class it belogns
	-classification head
		The output corresponding to the [CLS] token is fed into a classification head, typically a linear layer followed by a softmax activation, producing logits for each class (NSFW and SFW in this case). The class with the highest logit is selected as the predicted class.