const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-2'});
const table = 'triki';
let winner ="";
  
const createTriki = async (_players)=>{
    try {
        await documentClient.put(_players).promise();
    } catch (e) {
        return e;
    }
};


const updateTriki = async (_params)=>{
    try{
        await documentClient.update(_params).promise();
    }catch (e){
        return e;
    }
};

exports.handler = async (event) => {
    try {
        
        let form = event.play;
        let move = form.move;
        winner = form.winner;
        
            if (move==0){
                let parameter = {
                 TableName: table,
                      Item:{
                            id:form.id,
                            winner:form.winner,
                                players:[
                                    {
                                        player1:{
                                            "name":form.players[0].player1.name,
                                            "squares":[
                                                form.players[0].player1.squares
                                            ]
                                        }
                                    },
                                    {
                                        player2:{
                                            "name":form.players[1].player2.name,
                                            "squares":[
                                                form.players[1].player2.squares
                                            ]
                                        }
                                    },
                                ]
                            }
                        };
                    
                await createTriki(parameter);
                
                const response = {
                    statusCode: 200,
                    body: JSON.stringify(form.id),
                };
                return response;  
                
            }else if(move > 0){
                let params;
                if (form.turn=='X'){
                    params = {
                        TableName: table,
                        Key:{
                            "id":form.id,
                        },
                        UpdateExpression: "set players[0].player1.squares = :move",
                        ExpressionAttributeValues: {
                            ":move":form.players[0].player1.squares,
                        }
                    };
                }else{
                    params = {
                        TableName: table,
                        Key:{
                            "id":form.id,
                        },
                        UpdateExpression: "set players[1].player2.squares = :move",
                        ExpressionAttributeValues: {
                            ":move":form.players[1].player2.squares,
                        }
                    };
                }
                await updateTriki(params);
                
            }
            
            if (winner!=""){
                let params = {
                    TableName: table,
                    Key:{
                        "id":form.id,
                    },
                    UpdateExpression: "set winner = :win",
                    ExpressionAttributeValues: {
                        ":win":winner,
                    }
                };
                await updateTriki(params);
                
                const response = {
                    statusCode: 200,
                    body: JSON.stringify(winner),
                };
                return response;  
                }
            
            
    } catch (e) {
        const response = {
            statusCode:400,
            body: JSON.stringify(e)
        };
        return response;
    }
};

