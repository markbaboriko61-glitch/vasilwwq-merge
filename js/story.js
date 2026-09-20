/* Vasilwwq Merge - story */
const STORY=[
{id:'ch1',lvl:1,season:0,ru:'Глава 1. Добро пожаловать в Голливуд',en:'Chapter 1. Welcome to Hollywood',scenes:[
{bg:'street',chars:['stef_autumn'],reward:{coins:400,xp:60},lines:[
[null,'Осенний Голливуд встречает тёплым ветром и запахом кофе.','Autumn Hollywood greets you with warm wind and the smell of coffee.'],
['stef_autumn','Один чемодан, одна мечта. Начнём.','One suitcase, one dream. Let us begin.']]},
{bg:'cafe',chars:['stef_autumn','margo'],reward:{coins:450,xp:65},lines:[
['margo','Ты Стефания? Я Марго, агент. И у меня есть для тебя шанс.','You are Stefania? I am Margo, an agent. And I have a chance for you.'],
['stef_autumn','Я готова к любой работе.','I am ready for any job.']]},
{bg:'studio',chars:['stef_autumn','rick'],reward:{coins:500,gems:1,xp:70},lines:[
['rick','Кастинг через час. Образ соберёшь сама.','Casting in an hour. Put the look together yourself.'],
['stef_autumn','Значит, соберу.','Then I will.']]},
{bg:'studio',chars:['stef_autumn','bianca'],reward:{coins:520,xp:75},lines:[
['bianca','Новенькая? Не обольщайся.','New girl? Do not get your hopes up.'],
['stef_autumn','Посмотрим после проб.','Let us see after the audition.']]},
{bg:'street',chars:['stef_autumn','damir_casual'],reward:{coins:560,xp:80},lines:[
['damir_casual','Осторожно! Такси здесь не тормозят.','Careful! Taxis do not brake here.'],
['stef_autumn','Спасибо... Как тебя зовут?','Thank you... What is your name?'],
['damir_casual','Дамир. Каскадёр на студии.','Damir. A stuntman at the studio.']]},
{bg:'studio',chars:['stef_autumn','rick'],reward:{coins:600,gems:1,xp:85},lines:[
['rick','Неплохо. Очень неплохо.','Not bad. Very not bad.'],
['stef_autumn','Это значит да?','Does that mean yes?'],
['rick','Это значит маленькая роль.','It means a small role.']]},
{bg:'cafe',chars:['stef_autumn','damir_casual'],reward:{coins:640,xp:90},
choice:{ru:'Что важнее сейчас?',en:'What matters more right now?',options:[
{ru:'Пойти на свидание',en:'Go on a date',flag:'romance+'},
{ru:'Готовиться к съёмкам',en:'Prepare for the shoot',flag:'career+'}]},lines:[
['damir_casual','Празднуем первую роль?','Shall we celebrate the first role?']]},
{bg:'studio',chars:['stef_autumn','margo'],reward:{coins:700,gems:2,xp:100},lines:[
['margo','Тебя запомнили. Это главное.','People remembered you. That is what matters.'],
['stef_autumn','Значит, идём дальше.','Then we keep going.']]}
]},
{id:'ch2',lvl:4,season:1,ru:'Глава 2. Первые софиты',en:'Chapter 2. First spotlights',scenes:[
{bg:'studio',chars:['stef_autumn','rick'],reward:{coins:900,xp:110},lines:[
['rick','Зимний съёмочный блок. Готова?','Winter shooting block. Ready?'],
['stef_autumn','Более чем.','More than ready.']]},
{bg:'street',chars:['stef_autumn','damir_casual'],reward:{coins:950,xp:115},lines:[
['damir_casual','Гирлянды, кофе и ты. Хороший вечер.','Lights, coffee and you. A good evening.']]},
{bg:'cafe',chars:['stef_autumn','bianca'],reward:{coins:1000,gems:1,xp:120},lines:[
['bianca','Твою сцену отдали мне.','Your scene was given to me.'],
['stef_autumn','Значит, сделаю лучше следующую.','Then I will do the next one better.']]},
{bg:'studio',chars:['stef_autumn','margo'],reward:{coins:1050,xp:125},lines:[
['margo','Журнал хочет съёмку. Нужен образ.','A magazine wants a shoot. We need a look.']]},
{bg:'studio',chars:['stef_gala'],reward:{coins:1100,gems:1,xp:130},lines:[
['stef_gala','Впервые вижу себя такой.','This is the first time I see myself like this.']]},
{bg:'premiere',chars:['stef_gala','damir_tux'],reward:{coins:1200,xp:140},lines:[
['damir_tux','Ты сияешь ярче вспышек.','You shine brighter than the flashes.']]},
{bg:'premiere',chars:['stef_gala','bianca'],reward:{coins:1250,xp:145},
choice:{ru:'Бианка просит помочь с платьем.',en:'Bianca asks for help with her dress.',options:[
{ru:'Помочь ей',en:'Help her',flag:'friend+'},
{ru:'Отказать',en:'Refuse',flag:'rival+'}]},lines:[
['bianca','Мне некого больше просить.','I have nobody else to ask.']]},
{bg:'premiere',chars:['stef_gala','margo'],reward:{coins:1400,gems:2,xp:160},lines:[
['margo','Завтра о тебе напишут все.','Tomorrow everyone will write about you.']]}
]},
{id:'ch3',lvl:8,season:2,ru:'Глава 3. Весна перемен',en:'Chapter 3. Spring of change',scenes:[
{bg:'street',chars:['stef_spring'],reward:{coins:1500,xp:150},lines:[
['stef_spring','Город цветёт, и я вместе с ним.','The city is blooming, and so am I.']]},
{bg:'studio',chars:['stef_spring','rick'],reward:{coins:1550,xp:155},lines:[
['rick','Главная роль. Твоя.','Lead role. Yours.'],
['stef_spring','Я не подведу.','I will not let you down.']]},
{bg:'cafe',chars:['stef_spring','margo'],reward:{coins:1600,gems:1,xp:160},lines:[
['margo','Контракт на три фильма. Подписывай.','A three film contract. Sign it.']]},
{bg:'studio',chars:['stef_spring','damir_casual'],reward:{coins:1650,xp:165},lines:[
['damir_casual','Трюк сделаем вместе. Я рядом.','We will do the stunt together. I am right here.']]},
{bg:'street',chars:['stef_spring','bianca'],reward:{coins:1700,xp:170},lines:[
['bianca','Меня убрали из проекта.','They cut me from the project.'],
['stef_spring','И что теперь?','And what now?']]},
{bg:'cafe',chars:['stef_spring','bianca'],reward:{coins:1750,gems:1,xp:175},
choice:{ru:'Что сделаешь?',en:'What will you do?',options:[
{ru:'Позвать её в команду',en:'Invite her to the team',flag:'friend+'},
{ru:'Сосредоточиться на себе',en:'Focus on yourself',flag:'career+'}]},lines:[
['bianca','Ты можешь сказать нет. Я пойму.','You can say no. I would understand.']]},
{bg:'premiere',chars:['stef_gala','damir_tux'],reward:{coins:1850,xp:185},lines:[
['damir_tux','Твой фильм собрал полный зал.','Your film filled the whole hall.']]},
{bg:'premiere',chars:['stef_gala','margo'],reward:{coins:2000,gems:2,xp:200},lines:[
['margo','Ты уже не новенькая. Ты звезда.','You are not the new girl anymore. You are a star.']]}
]},
{id:'ch4',lvl:13,season:3,ru:'Глава 4. Лето любви',en:'Chapter 4. Summer of love',scenes:[
{bg:'street',chars:['stef_spring','damir_casual'],reward:{coins:2200,xp:190},lines:[
['damir_casual','Уедем к океану на один день?','Shall we escape to the ocean for one day?']]},
{bg:'cafe',chars:['stef_spring','margo'],reward:{coins:2300,xp:200},lines:[
['margo','Тебя номинировали на премию.','You have been nominated for an award.']]},
{bg:'studio',chars:['stef_spring','rick'],reward:{coins:2400,gems:1,xp:205},lines:[
['rick','Снять своё кино — вот следующая ступень.','Making your own film is the next step.']]},
{bg:'premiere',chars:['stef_gala'],reward:{coins:2500,xp:210},lines:[
['stef_gala','Эта награда — за все отказы, которые я пережила.','This award is for every rejection I survived.']]},
{bg:'street',chars:['stef_spring','bianca'],reward:{coins:2550,xp:215},lines:[
['bianca','Спасибо, что тогда не отвернулась.','Thank you for not turning away back then.']]},
{bg:'street',chars:['stef_spring','damir_casual'],reward:{coins:2600,gems:2,xp:220},
choice:{ru:'Дамир делает предложение.',en:'Damir proposes.',options:[
{ru:'Сказать да',en:'Say yes',flag:'engaged'},
{ru:'Попросить время',en:'Ask for time',flag:'wait'}]},lines:[
['damir_casual','Я хочу быть рядом всегда. Выйдешь за меня?','I want to be beside you always. Will you marry me?']]},
{bg:'wedding',chars:['stef_wedding','damir_tux'],reward:{coins:2800,gems:2,xp:240},lines:[
['stef_wedding','Я никогда не думала, что сказка бывает настоящей.','I never thought a fairytale could be real.']]},
{bg:'wedding',chars:['stef_wedding','margo','bianca'],reward:{coins:3000,gems:3,xp:260},lines:[
['margo','За Стефанию! И за её следующую мечту.','To Stefania! And to her next dream.']]}
]},
{id:'ch5',lvl:19,season:0,ru:'Глава 5. Своя студия',en:'Chapter 5. Your own studio',scenes:[
{bg:'map',chars:['stef_autumn','damir_casual'],reward:{coins:3000,xp:220},lines:[
['stef_autumn','Этот участок станет нашей студией.','This lot will become our studio.'],
['damir_casual','Значит, строим.','Then we build.']]},
{bg:'studio',chars:['stef_autumn','margo'],reward:{coins:3100,gems:2,xp:230},lines:[
['margo','Первый павильон готов. Нужны люди.','The first stage is ready. We need people.'],
['stef_autumn','Найдём тех, кому никто не дал шанс.','We will find those nobody gave a chance.']]},
{bg:'studio',chars:['stef_autumn','rick'],reward:{coins:3200,xp:240},lines:[
['rick','Ты зовёшь меня режиссёром?','You are inviting me as director?'],
['stef_autumn','Ты первый поверил в меня.','You believed in me first.']]},
{bg:'cafe',chars:['stef_autumn','bianca'],reward:{coins:3300,gems:1,xp:250},lines:[
['bianca','Возьмёшь меня в свой фильм?','Will you take me into your film?'],
['stef_autumn','Если придёшь на пробы, как все.','If you come to the audition, like everyone.']]},
{bg:'fashion',chars:['stef_gala'],reward:{coins:3400,xp:260},lines:[
['stef_gala','Неделя моды теперь часть нашей студии.','Fashion Week is part of our studio now.']]},
{bg:'premiere',chars:['stef_gala','damir_tux'],reward:{coins:3600,gems:3,xp:280},lines:[
['damir_tux','Первая премьера нашей студии.','The first premiere of our studio.'],
['stef_gala','И далеко не последняя.','And far from the last one.']]},
{bg:'wedding',chars:['stef_wedding','damir_tux'],reward:{coins:3800,gems:3,xp:300},
choice:{ru:'Куда развивать студию дальше?',en:'Where should the studio grow next?',options:[
{ru:'Семейное кино',en:'Family movies',flag:'family'},
{ru:'Большие блокбастеры',en:'Big blockbusters',flag:'career+'}]},lines:[
['damir_tux','Мы можем выбрать любой путь.','We can choose any path now.']]},
{bg:'map',chars:['stef_autumn','damir_casual','margo'],reward:{coins:4200,gems:5,xp:350},lines:[
['margo','История не заканчивается. Она только набирает обороты.','The story does not end. It is just picking up speed.'],
['stef_autumn','Значит, вперёд: новые герои, новые фильмы, новые сезоны.','So onward: new heroes, new films, new seasons.']]}
]}
];
