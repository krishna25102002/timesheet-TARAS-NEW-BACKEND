const bcrypt = require('bcryptjs');

class User {
    constructor(db) {
        this.collection = db.collection('users');
    }

    async create(employeeId, email, password, role, managerEmail, hierarchyManagerEmail) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.collection.insertOne({
            employeeId,
            email,
            password: hashedPassword,
            role,
            managerEmail,
            hierarchyManagerEmail
        });
    }

    async findByEmployeeId(employeeId) {
        return await this.collection.findOne({ employeeId });
    }

    async findByEmail(email) {
        return await this.collection.findOne({ email });
    }

    async updatePassword(employeeId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.collection.updateOne({ employeeId }, { $set: { password: hashedPassword } });
    }
}

module.exports = User;
