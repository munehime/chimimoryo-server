import { Forum, Role } from "./models";

async function seeding() {
    try {
        if ((await Role.estimatedDocumentCount()) === 0) {
            await Role.insertMany([
                { name: "users" },
                { name: "admin" }
            ]);
        }

        // if ((await Forum.estimatedDocumentCount()) === 0) {

        // }


    } catch (err) {
        console.error(err);
    }
}

export default seeding;
