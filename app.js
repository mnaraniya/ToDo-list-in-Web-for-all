//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
let uniqueSlug = require('unique-slug');


const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const day = date.getDate();

mongoose.connect("mongodb+srv://madmin:naraniya@cluster0-g1get.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
    
    let randomSlug = uniqueSlug();
    
    res.redirect("/" + randomSlug);
//        Item.find({}, function(err, items){
//        
//        if(items.length === 0){
//            Item.insertMany(defaultItems, function(err){
//            if(err){
//            console.log(err);
//            } else{
//            console.log("Successfully saved default items in db!");
//                }
//            });
//            res.redirect("/");
//        } else{
//            res.render("list", {listTitle: day, newListItems: items});
//        }
//        
//    });
});

app.get("/:custom", function(req, res){
    
    const customListName = _.capitalize(req.params.custom);
    
    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                name: customListName,
                items: defaultItems
                    });
                list.save();
                res.redirect("/" + customListName);
            } else{
                res.render("list", {listTitle1: day, listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });
    
});

app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const item = new Item({
        name: itemName
    });
    
    if(listName === day){
        item.save();
        res.redirect("/");    
    } else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
    
    
});

app.post("/delete", function(req, res){
    const checkboxId = req.body.checkbox;
    const listname = req.body.listName;
    
    if(listname === day){
        Item.findByIdAndRemove(checkboxId, function(err){
        if(err){
            console.log(err);
        } else{
            res.redirect("/");
        }
        });
    } else{
        List.findOneAndUpdate(
        {name: listname},
        {$pull: {items: {_id: checkboxId}}},
        function(err, foundList){
            if(!err){
                res.redirect("/" + listname);
            }
        }
        );
    }
    
    
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started!");
});
