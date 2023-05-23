const express=require("express");
const cors=require("cors");
const axios=require("axios");
const pg=require('pg');
require('dotenv').config()
const PORT=process.env.PORT||5000;
const url=process.env.URL;
const key=process.env.KEY;
const client=new pg.Client(process.env.DBURL);
const app=express();
app.use(express.json());
app.use(cors())

function Movies(title,posterPath,overview){
    this.title=title,
    this.posterPath=posterPath,
    this.overview=overview,
    this.allMovies.push(this)
}
Movies.allMovies=[];
function handleNotFound(){
    return {
    status:404,
    responeText:"Sorry, Page Not found"
    }
}
function handleServerErorr(){
    return {
        status:500,
        responeText:"Sorry something went wrong"
    }
}

app.get('/',(req,res)=>{
    try{
        const sql=`SELECT * from movies`;
    client.query(sql).then(data=>{
        res.json(data.rows)
    }).catch(err=>console.error(err))
    }catch{
        let error=handleServerErorr();
        res.status(error.status).send(error.responeText); 
    }
})
app.post('/movies',async(req,res)=>{
    console.log(req.body,"body")
    const userInput=req.body;
    const sql=`insert into movies(title,relase_date,comments,rating) values
    ($1,$2,$3,$4);`;
    const values=[userInput.title,userInput.relase_date,userInput.comments,userInput.rating]
   client.query(sql,values)
   .then(response=>res.send(response))
   .catch(err=>console.error(err))
});
app.get('/movie/:id',async(req,res)=>{
    const movieId=req.params.id;
    const sql=`SELECT * from movies WHERE id=${movieId};`
    let movie=await client.query(sql);
    res.status(200).send(movie.rows);
})
app.put('/update/:id',async(req,res)=>{
    let movieId=req.params.id;
    const {comments}=req.body;
    const values=[comments,movieId]
    const sql=`UPDATE movies SET comments=$1 WHERE id=$2;`;
let data=await client.query(sql,values)
res.status(200).send(data);
});
app.delete('/movies/:id',async(req,res)=>{
    let id=req.params.id;
    const sql=`DELETE FROM movies WHERE id=${id};`
    const deletedMovie=await client.query(sql);
    res.status(200).send(deletedMovie);
});
app.get('/trending',(req,res)=>{
    try{
      axios.get(`${process.env.URL}/search/movie?api_key=${process.env.KEY}&query=The&page=2`)
      .then((resp)=>{
       return res.send(resp.data)
    })
    }catch(err){
        console.log(err)
    }
})

app.get('/search',async(req,res)=>{
    let movieName=req.query;
    try{
        let movie=await axios.get(`${url}search/movie?api_key=${key}&language=en-US&query=${movieName}`)
        res.send(movie.data)
    }catch(err){
        console.log(err)
    }
})
app.get('/movie/:id/reviews',async(req,res)=>{
    const movieId=req.params.id;
    let movieRev=await axios.get(`${url}movie/${movieId}/reviews?api_key=${key}&language=en-US`);
    res.send(movieRev.data.results)
})
app.get('/movie/:id/similar',async(req,res)=>{
    let movieId=req.params.id;
    let similarMovie=await axios.get(`${url}movie/${movieId}/similar?api_key=${key}&language=en-US`)
    res.send(similarMovie.data.results)
})

app.get('*',(req,res)=>{
    let error=handleNotFound();
    res.status(error.status).send(error.responeText)
});
client.connect().then(con=>{
    app.listen(PORT,()=>{
        console.log(con);
        console.log(`listening on ${PORT}`)
    })
})
