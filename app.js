

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-Omar:test-123@cluster0.juco9.mongodb.net/toDoListDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

const item1 = new Item ({
  name: "Welcome to toDo List!"
});

const item2 = new Item ({
  name: 'click + to add new item'
});

const item3 = new Item ({
  name: '<-- click to delete an item'
});

const defaultItems = [item1, item2, item3];

const day = date.getDate();
app.get("/", function(req, res) {


Item.find({},function(err, foundItems){

  if (foundItems.length === 0) {
    Item.insertMany(defaultItems, function(err){
      if (err){
        console.log(err);
      } else {
        console.log('successfully saved default items to DB');
      }
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: day, newListItems: foundItems});
  }

})


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === day){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect(`/${listName}`);
    })
  }

});

app.post("/delete", function(req,res){
const checkedBoxId = req.body.checkbox;
const listName = req.body.listName;

if (listName === day) {
  Item.findByIdAndRemove(checkedBoxId,function(err){
    if (!err) {
      console.log("Removed");
      res.redirect("/");
    }

  })
} else {
  List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedBoxId}}},function(err,foundList){
    if (!err){
      res.redirect("/" + listName);
    }
  })
}


});

app.get('/:id', function(req, res) {

const id = _.capitalize(req.params.id);


List.findOne({name: id},function(err,list){
  if(!err){
    if (!list) {
      //Create a new list
      const list = new List ({
        name: id,
        items: defaultItems
      })
      list.save();
      res.redirect(`/${id}`);
    } else {
      //show the existing list
      res.render("list", {listTitle: list.name, newListItems: list.items});
    }
  }
})




});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
