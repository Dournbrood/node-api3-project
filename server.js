const express = require('express');

const server = express();

const helmet = require("helmet");
const morgan = require("morgan");

const UserDB = require("./users/userDb");
const PostDB = require("./posts/postDb");

//ALWAYS use these three. They are very helpful.
server.use(express.json());
server.use(helmet());
server.use(morgan("common"));

// Our logger goes here.
server.use(logger);

server.get('/', (req, res) => {
  res.send(`<h2>Let's write some middleware!</h2>`);
});

//This is NOT part of MVP and was proving more of a headache than it should have.
//GET to /api/posts/
// server.get("/api/posts", /* validateUserId(), */(request, response) => {
//   PostDB.get()
//     .then((posts) => {
//       response.status(200).json({ ...posts });
//     })
//     .catch((error) => {
//       console.log("\n \n !!! ~ *** ~ INTERNAL SERVER ERROR: ", error, " ~ *** ~ !!! \n \n");
//       response.status(500).json({ errorMessage: "Internal server error. Please scream at the devs." });
//     });
// })

//GET to /api/posts/ with a request body
server.get("/api/posts/", validateUserId, (request, response) => {
  const userID = request.body.user_id;
  UserDB.getUserPosts(userID)
    .then((userPosts) => {
      response.status(200).json({ ...userPosts });
    })
    .catch((error) => {
      console.log("\n \n !!! ~ *** ~ INTERNAL SERVER ERROR: ", error, " ~ *** ~ !!! \n \n");
      response.status(500).json({ errorMessage: "Internal server error. Please scream at the devs." });
    });
})

//POST to /api/posts/
server.post("/api/posts", validateUserId, validatePost, (request, response) => {
  PostDB.insert(request.body)
    .then((newPost) => {
      response.status(201).json({ ...newPost });
    })
    .catch((error) => {
      console.log("\n \n !!! ~ *** ~ INTERNAL SERVER ERROR: ", error, " ~ *** ~ !!! \n \n");
      response.status(500).json({ errorMessage: "Internal server error. Please scream at the devs." });
    });
})
//POST to /api/users/

server.post("/api/users", validateUser, (request, response) => {
  UserDB.insert(request.body)
    .then((newUser) => {
      response.status(201).json({ ...newUser });
    })
    .catch((error) => {
      console.log("\n \n !!! ~ *** ~ INTERNAL SERVER ERROR: ", error, " ~ *** ~ !!! \n \n");
      response.status(500).json({ errorMessage: "Internal server error. Please scream at the devs." });
    });
})

//PUT to /api/users/

server.put("/api/users", validateUserId, validateUser, (request, response) => {
  const { user_id, ...rest } = request.body
  UserDB.update(request.body.user_id, rest)
    .then((numUsersUpdated) => {
      response.status(202).json({ message: "Yay! It added!" });
    })
    .catch((error) => {
      console.log("\n \n !!! ~ *** ~ INTERNAL SERVER ERROR: ", error, " ~ *** ~ !!! \n \n");
      response.status(500).json({ errorMessage: "Internal server error. Please scream at the devs." });
    });
})

//DELETE to /api/users/

server.delete("/api/users", validateUserId, (request, response) => {
  UserDB.remove(request.body.user_id)
    .then((removedRecords) => {
      response.status(200).json({ message: "Removed successfully!" })
    })
})

//custom middleware

function logger(request, response, next) {
  const { method, url, body, params } = request;
  console.log(`\n *** ~${method} REQUEST TO ${url} AT [${Date.now()}]~ *** \n`);
  console.log("\nREQUEST BODY: ", body, "\nREQUEST PARAMS: ", params);
  next();
}

function validateUserId(request, response, next) {
  console.log("2 2");
  if (request.body !== undefined && request.body.user_id) {
    UserDB.getById(request.body.user_id)
      .then((validatedUser) => {
        if (validatedUser) {
          request.user = validatedUser;
          next();
        }
        else {
          response.status(400).json({ message: "Invalid user ID." });
        }
      })
      .catch((error) => {
        console.log("\n \n !!! ~ *** ~ INTERNAL SERVER ERROR: ", error, " ~ *** ~ !!! \n \n");
        response.status(500).json({ errorMessage: "Internal server error. Please scream at the devs." });
      });
  }
  else {
    response.send("Please supply a user ID in the body of your request!");
  }
}

function validateUser(request, response, next) {
  if (request.body) {
    if (request.body.name) {
      next();
    }
    else {
      response.status(404).json({ message: "Missing required name field!" });
    }
  }
  else {
    response.status(400).json({ message: "Missing user data!" })
  }
}

function validatePost(request, response, next) {
  if (request.body) {
    if (request.body.text) {
      next();
    }
    else {
      response.status(400).json({ message: "Missing reqUWUired text field!" })
    }
  }
  else {
    response.status(400).json({ message: "Missing post data!" });
  }
}


module.exports = server;
