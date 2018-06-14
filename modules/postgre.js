const { Pool,Client } = require('pg');
const pool = new Pool({user: 'igor',  host: '127.0.0.1',  database: 'taxicoin',  password: 'igor',  port: 5432})
var PayForOrder = async function(id,callback){
  await pool.connect(async (err, client, done) => {
      if (err) {
        callback('Error');
      }
      await client.query('UPDATE OrderHistory SET status=$1 WHERE id=$2;', ['Ожидает исполнения',id], (err, res) => {
        done()
        if (err) {
          callback('Error');
        } else {
          callback('OK');
        }
    
    })
  })
}
var RemoveOrder = async function(id,callback){
  await pool.connect(async (err, client, done) => {
      if (err) {
        callback('Error');
      }
      await client.query('DELETE FROM OrderHistory WHERE id=$1;', [id], (err, res) => {
        done()
        if (err) {
          callback('Error');
        } else {
          callback('OK');
        }
    
    })
  })
}
var AcceptOrder = async function(id,callback){
  await pool.connect(async (err, client, done) => {
      if (err) {
        callback('Error');
      }
      await client.query('UPDATE OrderHistory SET status=$1 WHERE id=$2;', ['Успешно завершен',id], (err, res) => {
        done()
        if (err) {
          callback('Error');
        } else {
          callback('OK');
        }
    
    })
  })
}
var GetOrderForExecute = async function(order,callback){
  await pool.connect(async (err, client, done) => {
      if (err) {
        callback('Error');
      }
      await client.query('UPDATE OrderHistory SET executor=$2,status=$3,executorAddress=$4 WHERE id=$1;', [order.id,order.executor,'Принят на исполнение',order.executorAddress], (err, res) => {
        done()
        if (err) {
          callback('Error');
        } else {
          callback('OK');
        }
    
    })
  })
}
var Login = async function(user,callback){
  await pool.connect(async (err, client, done) => {
      if (err) {
        callback('Error');
      }
     await client.query('SELECT login from users where (login=$1 and password=$2);', [user.login,user.password], (err, res) => {
        done()
        if (err) {
          callback('Error');
        } else {
          if(res.rowCount>0){
            callback('OK');
          }else{
            callback('Login or password incorrect!');
          }
        }
    
    })
  })
}
var getLogin = async function(login,callback){
  await pool.connect(async (err, client, done) => {
      if (err) {
        callback('Error');
      }
     await client.query('SELECT * from users where (login=$1)', [login], (err, res) => {
        done()
        if (err) {
          callback('Error');
        } else {
          if(res.rowCount>0){
            callback(res.rows[0]);
          }else{
            callback('Login not fined!');
          }
        }
    
    })
  })
}
var getOrderById = async function(id,callback){
  await pool.connect(async (err, client, done) => {
      if (err) {
        callback('Error');
      }
        await client.query('SELECT * FROM OrderHistory WHERE id=$1;', [id], (err, res) => {
          done()
          if (err) {
            callback('Error');
          } else {
            callback(res.rows[0]);
          }
      })
    });
}
var getOrders = async function(user,callback){
  await pool.connect(async (err, client, done) => {
      if (err) {
        callback('Error');
      }
        if(user.role=="Заказчик"){
        await client.query('SELECT * FROM OrderHistory WHERE (customer=$1 and (status=$2 or status=$3 or status=$4));', [user.login,'Ожидание оплаты','Ожидает исполнения','Принят на исполнение'], (err, res) => {
          done()
          if (err) {
            callback('Error');
          } else {
            callback(res.rows);
          }
      })
      }
      else{
        await client.query('SELECT * FROM OrderHistory WHERE ((executor=$1 or executor=$2) and (status=$3 or status=$4));', ['',user.login,'Ожидает исполнения','Принят на исполнение'], (err, res) => {
          done()
          if (err) {
            callback('Error');
          } else {
            callback(res.rows);
          }
      })
      }
      });    
}
var CreateOrder = async function(order,callback){
  await pool.connect(async (err, client, done) => {
      if (err) {
        callback('Error');
      }
      var date = new Date();
      var time = date;
      await client.query('INSERT INTO OrderHistory (time,frompoint,topoint,customer,executor,status,address,price,executorAddress) VALUES (CURRENT_TIMESTAMP , $1,$2,$3,$4,$5,$6,$7,$8);', [order.frompoint,order.topoint,order.customer,'','Ожидание оплаты',order.address,order.price,''],async (err, res) => {
        done()
        if (err) {
          callback('Error');
        } else {
          await client.query('SELECT * FROM OrderHistory WHERE (frompoint=$1 and topoint=$2 and customer=$3 and executor=$4 and status=$5 and address=$6 and price=$7);', [order.frompoint,order.topoint,order.customer,'','Ожидание оплаты',order.address,order.price], (err, res) => {
      
          callback(res.rows[0].id);});
        }
    })
  })
}
var Register = async function(user,callback){
    await pool.connect(async (err, client, done) => {
        if (err) {
          callback('Error');
        }
        if(user.login.length<3){
          callback('Login must be longer!')
          return;
        }
        if(user.password.length<3){
          callback('Password must be longer!')
          return;
        }
        var c=  await client.query('SELECT FROM users WHERE login=$1;',[user.login]);
        if(c.rowCount==0){
        await client.query('INSERT INTO users (login, password,privatekey,role) VALUES ($1, $2,$3,$4);', [user.login, user.password,user.privatekey,user.role], (err, res) => {
          done()
          if (err) {
            callback('Error');
          } else {
            callback('OK');
          }
        })
      }else{
        callback('Login already existed!')
      }
      })
    }
module.exports.Register=Register;
module.exports.GetOrderForExecute=GetOrderForExecute;
module.exports.CreateOrder=CreateOrder;
module.exports.Login=Login;
module.exports.RemoveOrder=RemoveOrder;
module.exports.getLogin=getLogin;
module.exports.getOrders=getOrders;
module.exports.PayForOrder=PayForOrder;
module.exports.AcceptOrder=AcceptOrder;
module.exports.getOrderById=getOrderById;
