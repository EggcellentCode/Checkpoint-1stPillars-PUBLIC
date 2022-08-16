const Sequelize = require('sequelize');
const db = require('./db');

const User = db.define('user', {
  // Add your Sequelize fields here
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },

  userType: {
    type: Sequelize.ENUM('STUDENT', 'TEACHER'),
    defaultValue: 'STUDENT',
    allowNull: false
  },

  isStudent: {
    type: Sequelize.DataTypes.VIRTUAL,
    get() {
      return this.userType === 'STUDENT';
    }
  },

  isTeacher: {
    type: Sequelize.DataTypes.VIRTUAL,
    get() {
      return this.userType === 'TEACHER';
    }
  }

});

User.findUnassignedStudents = async function () {
  return await User.findAll({
    where: {
      userType: 'STUDENT',
      mentorId: null
    }
  });
};

User.findTeachersAndMentees = async function () {
  return await User.findAll({
    where: {
      userType: 'TEACHER'
    },
    include: {
      model: User,
      as: 'mentees'
    },
  });
};

User.beforeUpdate(async function(updated) {
  let mentors = await User.findByPk(updated.mentorId);
  if (mentors !== null && mentors.userType === 'STUDENT') {
    throw new Error (`cannot update ${mentors.name} as they are not a TEACHER`);
  } else if ((await User.findByPk(updated.id)).mentorId !== null) {
    throw new Error (`cannot change userType from STUDENT to TEACHER for ${updated.name}`)
  } 
  //what I tried!
  //else if (await User.findTeachersAndMentees(updated.mentorId))...
  return updated;
  //could not figure out the final Hook conditional to check for mentees
  //I tried to use our function above findTeachersAndMentees but I was getting an error
});

/**
 * We've created the association for you!
 *
 * A user can be related to another user as a mentor:
 *       SALLY (mentor)
 *         |
 *       /   \
 *     MOE   WANDA
 * (mentee)  (mentee)
 *
 * You can find the mentor of a user by the mentorId field
 * In Sequelize, you can also use the magic method getMentor()
 * You can find a user's mentees with the magic method getMentees()
 */

User.belongsTo(User, { as: 'mentor' });
User.hasMany(User, { as: 'mentees', foreignKey: 'mentorId' });

module.exports = User;
