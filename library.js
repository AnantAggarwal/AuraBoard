async function getLeaderboard(db, room) {
    try {
        const roomRef = await db.collection("Rooms").doc(room);
        const doc = await roomRef.get();

        if (doc.exists) {
            const roomData = doc.data();
            const userIds = Object.keys(roomData);
            const leaderboardArray = [];

            for (const uid of userIds) {
                const displayName = await getDisplayName(db, uid);
                leaderboardArray.push({
                    uid: uid,
                    name: displayName,
                    score: roomData[uid],
                });
            }

            // Check for custom order
            if (doc.data().leaderboardOrder) {
                return {
                    order: doc.data().leaderboardOrder,
                    data: leaderboardArray
                }
            }

            leaderboardArray.sort((a, b) => b.score - a.score);
            return {
                order: leaderboardArray.map(player => player.uid),
                data: leaderboardArray
            }
        } else {
            console.log("No such document exists.");
            return {order: [], data: []};
        }
    } catch (error) {
        console.error("Error getting room data:", error);
        return {order: [], data: []};
    }
}

function populateLeaderboard(order, leaderboardData, draggable) {
    const tbody = document.getElementById("leaderboard-body");
    tbody.innerHTML = "";  // Clear existing rows
    const fragment = document.createDocumentFragment();  // Improve performance

    order.forEach((uid, index) => {
        console.log(uid)
        const player = leaderboardData.find(p => p.uid === uid);
        if (player) {
            const row = document.createElement("tr");
            row.setAttribute("draggable", draggable.toString()); // Ensure string format
            row.id = player.uid;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${player.name}</td>
                <td>hidden</td>
            `;

            fragment.appendChild(row);  // Append to fragment
        }
    });

    tbody.appendChild(fragment);  // Append all at once (better performance)
}



async function getPersonalLbd(db, uid, room) {
    try {
        const userRoomRef = db.collection("Users").doc(uid).collection("Rooms").doc(room);
        const userRoomDoc = await userRoomRef.get();

        if (userRoomDoc.exists && userRoomDoc.data() && userRoomDoc.data().lbd) {
            var array = userRoomDoc.data().lbd;
            const index = array.indexOf(uid);
            if (index > -1) { // only splice array when item is found
                array.splice(index, 1); // 2nd parameter means remove one item only
            }
            return array
        } else {
            return {};
        }
    } catch (error) {
        console.error("Error getting personal leaderboard:", error);
        return {};
    }
}

async function setPersonalLbd(db, uid, room, lbd) {
    try {
        const userRoomRef = await db.collection("Users").doc(uid).collection("Rooms").doc(room);
        console.log(lbd)
        if(lbd){
            await userRoomRef.set({lbd: lbd});
        }
        console.log("Successfully updated the personal leaderboard");
    } catch (error) {
        console.error("Error getting personal leaderboard:", error);
    }
}

async function getDisplayName(db, uid) {
    try {
        const userRef = db.collection("Users").doc(uid);
        const userDoc = await userRef.get();

        if (userDoc.exists && userDoc.data() && userDoc.data().name) {
            return userDoc.data().name;
        } else {
            return "Unknown";
        }
    } catch (error) {
        console.error("Error getting display name:", error);
        return "Unknown";
    }
}