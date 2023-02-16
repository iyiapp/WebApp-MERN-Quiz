const router = require('express').Router();
let User = require('../models/user.model');

router.route('/').get((req,res)=>{
    User.find()
        .then(users=> res.json(users))
        .catch(err=> res.status(400).json('Error:'+err));
});

router.route('/:username').get((req,res)=>{
    User.findOne({username:req.params.username})
        .then(User => res.json(User))
        .catch(err => res.status(400).json('Erro: '+err));
});

router.route('/add').post((req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const birth_date = Date.parse(req.body.birth_date);

    const newUser = new User({
        username,
        password,
        birth_date,
    });

    newUser.save()
        .then(()=> res.json('User added!'))
        .catch(err=>res.status(400).json('Error:'+err));
});

router.route('/result/:username').post((req,res)=>{
    User.findOne({username:req.params.username}).
    then(User=>{
        User.completed_quiz= req.body.completed_quiz;
        User.total_skill_point=  Number(req.body.total_skill_point);
        User.correct_answer_count=  Number(req.body.correct_answer_count);
        User.wrong_answer_count=  Number(req.body.wrong_answer_count);
        User.completion_time=  Number(req.body.completion_time);

        User.save()
            .then(()=> res.json('Quiz Completed!'))
            .catch(err=>res.status(400).json('Error:'+err));
    })
});

module.exports = router;