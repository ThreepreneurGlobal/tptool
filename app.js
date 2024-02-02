
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./Util/database');
const cors = require('cors')

const app = express();

app.use(cors())

app.use(bodyParser.json())

const userAdminRoutes = require('./Route/userLoginRoute');
const userRoute = require('./Route/superUserRoute');
const studentDataRoute = require('./Route/collageAdmin');
const studentDashboard = require('./Route/studentDashboard');
const forgetPassword = require('./Route/forgetPasswordRoute');
// const studentUserRoute = require('./Route/studentUserRoute');

const Organization = require('./Model/collageModel');
const User = require('./Model/userModel');

User.belongsTo(Organization, { foreignKey: 'collegeId' });

app.use(userAdminRoutes);
app.use(userRoute);
app.use(studentDataRoute);
app.use(studentDashboard);
app.use(forgetPassword)
// app.use(studentUserRoute);

  
sequelize
// .sync({ force: true })  
    .sync()
    .then(result => {  
        console.log('Database synced successfully');
        app.listen(7000);
    }) 
    .catch(err => {
        console.error('Error syncing database:', err);
    }); 



 

    


    // app.listen(4000, () => {
    //   //   console.log(`Server is running on 4000`);
    //   // });



// const express = require('express');
// const bodyParser = require('body-parser');
// const axios = require('axios')
// const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }))

// // const jsonData = [
// //   { "title": "News 1", "content": "Content 1" },
// //   { "title": "News 2", "content": "Content 2"},
// //   { "title": "News 3", "content": "Content 3"},
// //   { "title": "News 4", "content": "Content 4" },
// //   { "title": "News5", "content": "Content 5" }
// // ];


// app.post('/api/post-news-to-crudcrud', async (req, res) => {
//   try {

//     const newsApiResponse = await axios.get('https://newsapi.org/v2/top-headlines?country=in&apiKey=5e372c4d5d9c4a1b92ef2e93e403d5b1');

//     const newsArticles = newsApiResponse.data.articles;
//     // console.log(newsArticles, 'in the article')

//     posts = () => {
//       for (let i=0; i<10; i++) {
//         let aritcl = newsArticles[i].newsArticles
//       }
//     } 

//     console.log(posts)
//     const crudCrudResponse = await axios.post('https://crudcrud.com/api/3aee25b5a5dc403eb7c0b5d2bd1cd083/news', {
//       news: newsArticles,
//     });

//     // console.log('CRUD Crud response', crudCrudResponse.data);

//     res.json({ message: 'News sent to crud crud' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'error in sending articles' });
//   }
// });


// app.listen(4000, () => {
//   console.log(`Server is running on 4000`);
// });

