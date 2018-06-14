const {Pool}=require('pg');
var foo = require('./js/TaxiCoin.json');
const pool = new Pool({user: 'igor',  host: '127.0.0.1',  database: 'taxicoin',  password: 'igor',  port: 5432, idleTimeoutMillis: 30000,connectionTimeoutMillis: 2000});
var cookieSession = require('cookie-session')
var postgre=require('./modules/postgre');
var contract=require('./modules/Contract');
var cookieParser = require('cookie-parser')
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var app=new express();
contract.init(foo,async function(responce){
    await (postgre.getOrderById(responce.args.id.toString(),async function(order){
    if((responce.args.spender.toLowerCase()=='0xf7323EAa895Ac13eAeBE5863CFf8471f41C9Be2a'.toLowerCase())&&(responce.args.value.toString()==order.price))
    {
        await postgre.PayForOrder(responce.args.id.toString(),
        function(res){
            console.log(responce.args.id+' payed');
            
        })
    }}))
});
app.use(cookieParser())
app.use(cookieSession({
    name: 'session',
    keys: ['123','321'],
    maxAge: 24 * 60 * 60 * 1000
  }))
app.use(express.static('js'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.get('/taxicoin',function(req,res,next){
    res.json(foo);
});


app.get('/',async function(req,res,next){
if(req.session.user)
    await (postgre.getLogin(req.session.user,async function(user){
        await (postgre.getOrders(user,function(orders){
            res.render('personal.pug',{username:user.login,role:user.role,orders:orders})
        })) 
    }))
    else{
        res.render('index.pug',{name:"Guest"});
    }
})
app.post('/createorder',async function(req,res,next){
    const order=req.body;
    order.customer=req.session.user;
    if(order.address){
    await (postgre.CreateOrder(order,function(result){
        res.json({status:result})
    }))
    }else{
        await (postgre.getLogin(req.session.user,function(user){
            return user.privateKey;
        }).then(function(resu){
           contract.getAcc(resu,function(r){
            order.address=r;
            await (postgre.CreateOrder(order,function(result){
                res.json({status:result})
        }))
           });
        })
    )}
})
app.post('/removeorder',async function(req,res,next){
    const id=req.body.id;
    await (postgre.RemoveOrder(id,async function(result){
        res.json({status:result});
    }))
})

app.post('/acceptorder',async function(req,res,next){
    const id=req.body.id;
    await postgre.getOrderById(id,async function(res1){
        if(res1.customer==req.session.user){
        await (postgre.AcceptOrder(id,async function(result){
            if(result=='OK'){
                contract.AcceptOrder(res1);
                res.json({status:result});
            }}))
        }
        else{
            res.json({status:'Error'});
        }
        })
})
app.post('/getorder',async function(req,res,next){
    const order=req.body;
    order.executor=req.session.user;
    await (postgre.GetOrderForExecute(order,function(result){
        res.json({status:result})
    }))
})
app.post('/login',async function(req,res,next){
    const user=req.body;
    if(!req.session.user){
        await (postgre.Login(user,function(result){
           if(result=='OK'){
            req.session.user=user.login;
           }
            res.json({status:result})

        }))
    }else{
        res.json({status:'Already logined as '+req.session.user})
    }
})
app.get('/logout',async function(req,res,next){
    if(req.session.user){
        req.session.user=undefined;
        res.clearCookie('session');
        res.clearCookie('session.sig');
        res.send("OK");
    }else{
        res.sendStatus(403);
    }
    })
app.post('/register',async function(req,res,next){
const user=req.body;
if(!req.session.user){
    await (postgre.Register(user,function(result){
        if(result=='OK'){
            req.session.user=user.login;
           }
        res.json({status:result})
    }))
}else{
    res.json({status:'Already logined as'+req.session.user})
}
})

app.listen(9229);