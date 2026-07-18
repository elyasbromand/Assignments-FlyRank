import express from 'express';

const app = express();

const port = 3000;

var tasks = [
    {"id": 1, "title": "Journal Writing", "status": "false"},
    {"id": 2, "title": "Exercise", "status": "true"},
    {"id": 3, "title": "Read a book", "status": "false"},
]

app.get("/", (req, res) => {
    res.json({"name": "Task API","version": "1.0", "endpoints": ["/tasks"] });
});

app.get("/health", (req, res) => {
    res.json({"status": "ok"});
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
    else
    {
        res.status(404).json({"error": `Task ${taskId} not found`});    
    }
});

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
})