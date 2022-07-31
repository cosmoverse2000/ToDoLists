//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");



const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://" + process.env.MONGO_ID + "@cluster0.ctj2b.mongodb.net/" + process.env.DB_NAME, { useNewUrlParser: true });

//CREATION OF 'ITEMS' SCHEMA AND MODEL
const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("item", itemsSchema);

//CREATION OF 'LIST' SCHEMA AND MODEL
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});
const List = mongoose.model("list", listSchema);


// CREATION OF NEW DOC's FOR 'ITEMS' COLLECTION
const item1 = new Item({
  name: "Buy Food",
});
const item2 = new Item({
  name: "Cook Food",
});
const item3 = new Item({
  name: "Eat Food",
});
//Array of Above
const arrayOfDoc = [item1, item2, item3];


app.get("/", function (req, res) {

  // const day = date.getDate();
  Item.find((err, resultItems) => {
    if (err) { console.log(err); }
    else {
      if (resultItems.length === 0) {
        Item.insertMany([item1, item2, item3], (err) => {
          if (err) { console.log(err); }
          else {
            console.log("Inserted SuccessFully");
          }
        })
        res.redirect("/");
      }
      else {
        res.render("list", { listTitle: "Today", newListItems: resultItems });

      }
    }
  })

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  if (listName === "Today") {
    const addedItem = new Item({
      name: itemName,
    });

    addedItem.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: listName }, (err, results) => {
      results.items.push({ name: itemName });
      results.save();
      res.redirect("/" + listName);
    })
  }

});

app.post("/delete", function (req, res) {
  const checkbox = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(req.body.checkbox, (err) => {
      if (err) { console.log(err) }
      else {
        // console.log("deleted");
        res.redirect("/");
      }
    });
  }
  else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkbox } } }, (err) => {
      if (err) { console.log(err) }
      else {
        res.redirect("/" + listName);
      }
    })
  }


});

// CREATION OF DAYANAMIC LISTSOF DIFFERENT PURPOSE
app.get("/:newList", function (req, res) {
  const paramNew = _.capitalize(req.params.newList);
  List.findOne({ name: paramNew }, (err, resultsList) => {
    if (err) { console.log(err) }
    else {
      if (!resultsList) {
        const list1 = new List({
          name: paramNew,
          items: arrayOfDoc,
        })
        list1.save();
        console.log(resultsList, "jdf")
        // res.render("list", { listTitle: paramNew, newListItems: resultsList.items });
        res.redirect("/" + paramNew);
      }
      else {
        // console.log(resultsList);
        res.render("list", { listTitle: paramNew, newListItems: resultsList.items });
      }

    }
  });
  // res.render("list", { listTitle: "Work List", newListItems: workItems });
});



app.get("/about", function (req, res) {
  res.render("about");
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started on port");
});
