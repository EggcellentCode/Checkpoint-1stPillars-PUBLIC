const router = require('express').Router();
const {
  models: { User },
} = require('../db');

/**
 * All of the routes in this are mounted on /api/users
 * For instance:
 *
 * router.get('/hello', () => {...})
 *
 * would be accessible on the browser at http://localhost:3000/api/users/hello
 *
 * These route tests depend on the User Sequelize Model tests. However, it is
 * possible to pass the bulk of these tests after having properly configured
 * the User model's name and userType fields.
 */

// Add your routes here:

router.get('/unassigned', async (req, res) => {
  try {
    res.json(await User.findUnassignedStudents());
  } catch (error) {
    throw new Error(error);
  }
});

router.get('/teachers', async (req, res) => {
  try {
    res.json(await User.findTeachersAndMentees());
  } catch (error) {
    throw new Error(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (isNaN(req.params.id)) {
      res.sendStatus(400);
    }
    else {
    let userInstance = await User.destroy({
      where: {
        id: req.params.id
      },
    });
    if (userInstance) res.sendStatus(204);
    if (!userInstance) res.sendStatus(404);
  }
  } catch (error) {
    throw new Error(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.sendStatus(404);
    } else {
      //I am assuming I am not able to send status 200 because my updated user function is not complete here
      //But this is how I would handle 
      res.status(200).send(user.updated(req.body));
    }
  } catch(error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const [users, wasCreated] = await User.findOrCreate({
      where: req.body
    });
    if (wasCreated) {
      res.status(201).send(users);
    } else {
      res.status(409).send('Incorrect status code');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
