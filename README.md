# conversational_chatbot

### Steps to run the code
* Navigate to project root folder and fire command
```
pip install -r requirements.txt
```
* Navigate inside backend folder and fire below command
```
uvicorn main:app --reload --port 8000
```
this will start your fastapi endpoint

* Now navigate to frontend folder and fire below two command (Make sure you have npm installed)
```
npm install
```

```
npm run dev
```
This command will run the vite and you must have an endpoint in the terminal.
You can open that link in the browser to see the chatbot UI. 
