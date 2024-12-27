import os
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification, TextClassificationPipeline
# loads various tool frm huggin face (NLP) bscly loads and classify text using pre trained model
# btw hugging face wrk with nlp models

# from huggingface_hub.file_download import http_get
# http_get_kwargs = {"timeout": 120}
# above 2 lines are optional . it can be used if net speed is slow


# suppress TensorFlow warnings . it keeps o/p clean 
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' #3 means, only 3 error will be shown thats it
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

#here it gets classified like wch is nsfw like that (like its set up stuffs.)
try:
    pipe = pipeline("text-classification", model="eliasalbouzidi/distilbert-nsfw-text-classifier")
    print("Pipeline loaded successfully.")
except Exception as e:
    print(f"Error loading pipeline: {e}")

# Loads model and basically converts raw text to model can understand lang
try:
    tokenizer = AutoTokenizer.from_pretrained("eliasalbouzidi/distilbert-nsfw-text-classifier")
    model = AutoModelForSequenceClassification.from_pretrained("eliasalbouzidi/distilbert-nsfw-text-classifier")
    print("Model and tokenizer loaded successfully.")
except Exception as e:
    print(f"Error loading model or tokenizer: {e}")

# Initialiinww the TextClassificationPipeline
# TextClassificationPipeline : a class frm hugging-face wch performs text classification
textClassifier = TextClassificationPipeline(model=model, tokenizer=tokenizer)


newTweets = [
    "Percocet",
    "This girl is super hot and stunning!",
    "Had an amazing cup of coffee this morning.",
    "Just finished a killer workout!",
    "sex",
    "fuck me",
    "daddy fuck me",
    "wet",
    "boobs",
    "girl",
    "bikini",
    "nude boobs in dm",
    "being the big spoon so i can stroke him from behind and kiss his neck",
    "say hi if you want goth girl nudes",
    "Fuck it , sending boobs pic to everyone who says hi",
    "anyone wants to eat my ass",
    "twin bitches hopin off my jetski",
    "i wanna fuck you slow in the late night",
    "wet ass pussy",
    "now she hit the grocery shop looking lavish",
    "shawty make to work 9-5 type shit",
    "wanna fuck my tits",
    "baby your love's got me the best",
    "fuck me like your husband",
    "then she clean it with her face",
    "girls get loose when they hear the song",
    "i want you to fill my pussy with your cum",
    "let me wash you with my small titties",
    "trying to make sure i show you this boobs you always want to cum to",
    "lets spend the evening together",
    "i love it when you give me attention",
    "i am the kind of girl who is always ready to be pounded",
    "when did you fuck your first asian",
    "i love it when he penetrates my throat",
    "good girls never wear panties under their skirts",
    "i was made just to please you",
    "spank me while i taste your d this night",
    "barely legal and always down to breed",
    "its not the biggest but its so soft and squishy",
    "let me put a smile on your faces this cold evening",
    "feels good to get filled up"
]

# Classifyin' the tweet
threshold=0.955 #confidence checker

for tweet in newTweets:
    result = textClassifier(tweet)
    label = result[0]['label']
    score = result[0]['score']
    
    if label == "nsfw" and score<threshold:
        label = "uncertain"
    
    print(f"Tweet: '{tweet}'")
    print(f"Classification result: {result}\n")