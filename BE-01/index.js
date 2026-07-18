import express from 'express';

const app = express();

app.use(express.json());

const port = 3000;

var tasks = [
    {"id": 1, "title": "Journal Writing", "done": "false"},
    {"id": 2, "title": "Exercise", "done": "true"},
    {"id": 3, "title": "Read a book", "done": "false"},
]

app.get("/", (req, res) => {
    res.json({"name": "Task API","version": "1.0", "endpoints": ["/tasks"] });
});

app.get("/health", (req, res) => {
    res.json({"done": "ok"});
});

app.get("/tasks", (req, res) => {
    res.json(tasks);
});

app.get("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);
    
    const task = tasks.find(task => task.id === taskId);
    if(task)
    {
        res.json(task);
    }
    res.status(404).json({"error": `Task ${taskId} not found`});    
    
});

app.post("/tasks", (req, res) =>{
    const {title} = req.body;
    if(!title || title.trim() === "")
    {
        res.status(400).json({"error": "Title is required"});
    }

    const newTask = {
        id: tasks.length + 1,
        title: title,
        done: "false"
    };

    tasks.push(newTask);

    res.json(newTask);
})

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
})