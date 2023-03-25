import { connectToDatabase } from "../../../utils/mongodb";

async function handler(req, res) {
    try {
        const { method } = req
        if (method === "POST") {
            const { db } = await connectToDatabase();
            const body = JSON.parse(req.body);

            const acc = await db.collection("bet").countDocuments({ roomCode: { $exists: true, $in: [body.roomCode] } })

            if (acc) {
                var obj = { roomCode: body.roomCode, publicKey: body.publicKey, bet: body.bet };

                var myquery = { roomCode: body.roomCode };

                const updatedbet = await db
                    .collection("bet")
                    .updateOne(myquery, { $set: { bet: body.bet, time: new Date() } }, function (err, res) {
                        if (err) {
                            console.log(err)
                        };
                        console.log("1 document updated");
                    });
                res.json(updatedbet)
            } else {
                var obj = { publicKey: body.publicKey, roomCode: body.roomCode, bet: body.bet, time: new Date() };

                const createdBet = await db
                    .collection("bet")
                    .insertOne(obj, function (err, res) {
                        if (err) {
                            console.log(err)
                        };
                        console.log("1 document added");
                    });
                res.json(createdBet)
            }
        }
    }
    catch (err) {
        console.log(err)
    }
}

export default handler