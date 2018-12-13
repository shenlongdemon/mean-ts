# 

# BUILD

- We can build 

## Nodejs

- Build nodejs to `mean-ts/dist` 

## Angular

- Build Angular to `mean-ts/static/portal/dist`

```bash
"deploy" : "ng build --prod"
```

# DATABASE

## MongoDB

- Start mongodb with command

```base
mongod --dbpath /Users/nguyenthanhlong/DATA/mongodb
```

### Create Index for searching

- Open terminal/cmd 
- Go to bin directory of mongodb
- Run command "mongo"
- List out list of database by command "show dbs"
- switch to SellRecognizer by command "use SellRecognizer"
- We can view list of collections by command "show collections"
- Create index for searching on collection "Items" based on field "name"
    + db.Items.createIndex({name:"text"})
    
# UPLOAD FILES

- We save on `./static/public/<service>`
- And we `this.app.use(express.static(__dirname + '/../static/public'));`
- So when we want to retrieve files, we can use link
  ```bash
  http://host:port/<service>/filename.extention
  ```