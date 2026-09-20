/* Vasilwwq Merge - data */
const CHAINS=[
{id:'clothing',base:14,ru:'Гардероб',en:'Wardrobe',items:[['Футболка','T-shirt'],['Блуза','Blouse'],['Юбка','Skirt'],['Жакет','Jacket'],['Платье','Dress'],['Коктейльное платье','Cocktail dress'],['Вечернее платье','Evening gown'],['Кутюр','Couture look'],['Платье со шлейфом','Gown with train'],['Платье звезды','Star gown']]},
{id:'makeup',base:12,ru:'Макияж',en:'Makeup',items:[['Бальзам','Lip balm'],['Помада','Lipstick'],['Тушь','Mascara'],['Румяна','Blush'],['Тени','Eyeshadow'],['Палетка','Palette'],['Хайлайтер','Highlighter'],['Косметичка','Makeup bag'],['Набор визажиста','Pro kit'],['Студия красоты','Beauty studio']]},
{id:'bags',base:16,ru:'Сумки',en:'Bags',items:[['Кошелёк','Coin purse'],['Клатч','Clutch'],['Мини-сумка','Mini bag'],['Сумка на цепочке','Chain bag'],['Тот','Tote'],['Сатчель','Satchel'],['Кожаная сумка','Leather bag'],['Дизайнерская сумка','Designer bag'],['Кутюр-сумка','Couture bag'],['Легендарная сумка','Iconic bag']]},
{id:'jewelry',base:20,ru:'Украшения',en:'Jewelry',items:[['Бусина','Bead'],['Колечко','Ring'],['Серёжки','Earrings'],['Браслет','Bracelet'],['Кулон','Pendant'],['Ожерелье','Necklace'],['Брошь','Brooch'],['Колье','Diamond collar'],['Тиара','Tiara'],['Корона звезды','Star crown']]},
{id:'awards',base:26,ru:'Награды',en:'Awards',items:[['Значок','Badge'],['Грамота','Diploma'],['Лента','Ribbon'],['Медаль','Medal'],['Кубок','Small trophy'],['Золотой кубок','Golden trophy'],['Статуэтка','Statuette'],['Премия критиков','Critics award'],['Главная премия','Grand award'],['Звезда аллеи','Walk of fame star']]},
{id:'film',base:22,ru:'Кино',en:'Cinema',items:[['Хлопушка','Clapperboard'],['Сценарий','Script'],['Катушка','Film reel'],['Микрофон','Microphone'],['Софит','Studio light'],['Камера','Camera'],['Кран с камерой','Camera crane'],['Монтажная','Editing room'],['Павильон','Sound stage'],['Киностудия','Film studio']]},
{id:'shoes',base:15,ru:'Обувь',en:'Shoes',items:[['Балетки','Flats'],['Кеды','Sneakers'],['Мюли','Mules'],['Босоножки','Sandals'],['Туфли','Pumps'],['Сапоги','Boots'],['Шпильки','Stilettos'],['Дизайнерские туфли','Designer heels'],['Туфли с кристаллами','Crystal heels'],['Хрустальные туфельки','Glass slippers']]},
{id:'perfume',base:18,ru:'Парфюм',en:'Perfume',items:[['Пробник','Sample'],['Роллер','Roll-on'],['Спрей','Body spray'],['Туалетная вода','Eau de toilette'],['Парфюмная вода','Eau de parfum'],['Флакон с бантом','Bow flacon'],['Авторский аромат','Signature scent'],['Нишевый парфюм','Niche perfume'],['Кристальный флакон','Crystal flacon'],['Аромат звезды','Star fragrance']]},
{id:'flowers',base:11,ru:'Цветы',en:'Flowers',items:[['Семечко','Seed'],['Росток','Sprout'],['Бутон','Bud'],['Роза','Rose'],['Пион','Peony'],['Маленький букет','Small bouquet'],['Букет роз','Rose bouquet'],['Корзина цветов','Flower basket'],['Цветочная арка','Flower arch'],['Цветочный сад','Flower garden']]},
{id:'cafe',base:10,ru:'Кафе',en:'Cafe',items:[['Стакан воды','Water cup'],['Эспрессо','Espresso'],['Капучино','Cappuccino'],['Смузи','Smoothie'],['Круассан','Croissant'],['Макаруны','Macarons'],['Тортик','Cake slice'],['Завтрак звезды','Star breakfast'],['Бранч-сет','Brunch set'],['Своё кафе','Own cafe']]},
{id:'transport',base:24,ru:'Транспорт',en:'Transport',items:[['Самокат','Scooter'],['Велосипед','Bicycle'],['Мопед','Moped'],['Такси','Taxi'],['Кабриолет','Cabriolet'],['Спорткар','Sports car'],['Лимузин','Limousine'],['Яхта','Yacht'],['Вертолёт','Helicopter'],['Частный джет','Private jet']]},
{id:'starlife',base:34,ru:'Звёздная жизнь',en:'Star life',items:[['Автограф','Autograph'],['Билет на кастинг','Casting ticket'],['Пропуск на студию','Studio pass'],['Обложка журнала','Magazine cover'],['Контракт','Contract'],['Красная дорожка','Red carpet'],['Премьера','Premiere'],['Собственный бренд','Own brand'],['Свадьба года','Wedding of the year'],['Своя киностудия','Own film studio']]},
{id:'fashion',base:28,event:true,ru:'Неделя моды',en:'Fashion Week',items:[['Эскиз','Sketch'],['Ткань','Fabric'],['Лекало','Pattern'],['Швейная машинка','Sewing machine'],['Манекен','Mannequin'],['Примерка','Fitting'],['Лук с подиума','Runway look'],['Финал показа','Show finale'],['Коллекция','Collection'],['Дом моды','Fashion house']]}
];
const CHAIN_BY_ID={}; CHAINS.forEach(c=>CHAIN_BY_ID[c.id]=c);
const GENS=[
{id:0,img:'gen_1',ru:'Бутик',en:'Boutique',main:'clothing',extra:'shoes',cost:3,unlock:1},
{id:1,img:'gen_2',ru:'Салон красоты',en:'Beauty salon',main:'makeup',extra:'perfume',cost:3,unlock:1},
{id:2,img:'gen_3',ru:'Бутик сумок',en:'Bag boutique',main:'bags',extra:'jewelry',cost:4,unlock:3},
{id:3,img:'gen_4',ru:'Ювелир',en:'Jeweler',main:'jewelry',extra:'awards',cost:5,unlock:5},
{id:4,img:'gen_5',ru:'Киноплощадка',en:'Film set',main:'film',extra:'awards',cost:5,unlock:8},
{id:5,img:'gen_6',ru:'Цветочная лавка',en:'Flower shop',main:'flowers',extra:'cafe',cost:4,unlock:11},
{id:6,img:'gen_7',ru:'Гараж',en:'Garage',main:'transport',extra:'film',cost:6,unlock:14},
{id:7,img:'gen_8',ru:'Агентство',en:'Agency',main:'starlife',extra:'awards',cost:7,unlock:17},
{id:8,img:'gen_9',ru:'Обувной бутик',en:'Shoe boutique',main:'shoes',extra:'clothing',cost:4,unlock:4},
{id:9,img:'gen_10',ru:'Парфюмерная лавка',en:'Perfume shop',main:'perfume',extra:'makeup',cost:4,unlock:7},
{id:10,img:'gen_11',ru:'Кафе',en:'Cafe',main:'cafe',extra:'flowers',cost:3,unlock:10},
{id:11,img:'gen_12',ru:'Транспортная служба',en:'Transport service',main:'transport',extra:'starlife',cost:6,unlock:13}
];
const EVENT_GEN={id:100,img:'gen_8',ru:'Ателье',en:'Atelier',main:'fashion',extra:null,cost:3,unlock:1};
const CHARS=[
{id:'margo',ru:'Марго',en:'Margo'},{id:'rick',ru:'Рик',en:'Rick'},{id:'bianca',ru:'Бианка',en:'Bianca'},
{id:'damir_casual',ru:'Дамир',en:'Damir'},{id:'damir_tux',ru:'Дамир',en:'Damir'},
{id:'stef_autumn',ru:'Стефания',en:'Stefania'},{id:'stef_gala',ru:'Стефания',en:'Stefania'},
{id:'stef_spring',ru:'Стефания',en:'Stefania'},{id:'stef_wedding',ru:'Стефания',en:'Stefania'}
];
const NPCS=[
{id:'npc_01',ru:'Оливия',en:'Olivia'},
{id:'npc_02',ru:'Мистер Грант',en:'Mr. Grant'},
{id:'npc_03',ru:'Наоми',en:'Naomi'},
{id:'npc_04',ru:'Лили',en:'Lily'},
{id:'npc_05',ru:'Леди Роуз',en:'Lady Rose'},
{id:'npc_06',ru:'Кармен',en:'Carmen'},
{id:'npc_07',ru:'Джесси',en:'Jessie'},
{id:'npc_08',ru:'Пол',en:'Paul'},
{id:'npc_09',ru:'Виктория',en:'Victoria'},
{id:'npc_10',ru:'Мия',en:'Mia'},
{id:'npc_11',ru:'Зои',en:'Zoe'},
{id:'npc_12',ru:'Артур',en:'Arthur'},
{id:'npc_13',ru:'Кристи',en:'Christy'},
{id:'npc_14',ru:'Тимми',en:'Timmy'},
{id:'npc_15',ru:'Хелен',en:'Helen'},
{id:'npc_16',ru:'Клара',en:'Clara'},
{id:'npc_17',ru:'Энцо',en:'Enzo'},
{id:'npc_18',ru:'Ирис',en:'Iris'},
{id:'npc_19',ru:'Брайан',en:'Brian'},
{id:'npc_20',ru:'Юна',en:'Yuna'}
];
const LOCS=[
{id:'apart',bg:'loc_apart',gens:[0,1]},
{id:'cafe',bg:'cafe',gens:[1,5]},
{id:'park',bg:'loc_park',gens:[5,1]},
{id:'boutique',bg:'loc_boutique',gens:[0,2]},
{id:'salon',bg:'loc_salon',gens:[1,2]},
{id:'studio',bg:'studio',gens:[4,7]},
{id:'theatre',bg:'premiere',gens:[3,7]},
{id:'mall',bg:'loc_mall',gens:[0,2]},
{id:'jewel',bg:'loc_jewel',gens:[2,3]},
{id:'beach',bg:'loc_beach',gens:[5,6]},
{id:'marina',bg:'loc_marina',gens:[6,5]},
{id:'rooftop',bg:'loc_rooftop',gens:[5,7]},
{id:'hills',bg:'loc_hills',gens:[3,6]},
{id:'sign',bg:'loc_hills',gens:[7,3]},
{id:'awards',bg:'loc_awards',gens:[3,7]},
{id:'airport',bg:'loc_airport',gens:[6,7]},
{id:'desert',bg:'loc_desert',gens:[4,6]},
{id:'penthouse',bg:'loc_penthouse',gens:[7,3]},
{id:'lot',bg:'loc_lot',gens:[4,6]}
];
const ORDER_LINES=[['Мне это нужно к вечеру!','I need this by tonight!'],['Съёмка через час, выручай.','Shoot in an hour, help me out.'],['Для обложки журнала.','For the magazine cover.'],['Клиент очень важный.','The client is very important.'],['Хочу блистать на премьере.','I want to shine at the premiere.'],['Это для красной дорожки.','This is for the red carpet.'],['Подарок для подруги.','A gift for a friend.'],['Режиссёр сказал: срочно.','The director said: urgent.'],['Без этого образ не собрать.','The look does not work without it.'],['Обещаю хорошие чаевые.','I promise a good tip.'],['Фотографы уже ждут.','The photographers are waiting.'],['Сегодня особенный вечер.','Tonight is a special night.']];
const QUEST_POOL=[
{id:'merge',ru:'Сделай %n слияний',en:'Make %n merges',target:[25,45,70],reward:{coins:900,gems:1,xp:60}},
{id:'orders',ru:'Выполни %n заказов',en:'Complete %n orders',target:[4,7,11],reward:{coins:1200,gems:2,xp:80}},
{id:'taps',ru:'Используй генераторы %n раз',en:'Use generators %n times',target:[30,55,85],reward:{coins:700,xp:50}},
{id:'discover',ru:'Открой %n новых предметов',en:'Discover %n new items',target:[3,5,7],reward:{coins:1000,gems:1,xp:70}},
{id:'sell',ru:'Продай %n предметов',en:'Sell %n items',target:[5,9,14],reward:{coins:600,xp:40}},
{id:'spend',ru:'Потрать %n энергии',en:'Spend %n energy',target:[60,110,170],reward:{coins:800,gems:1,xp:55}}
];
const SHOP={
 gems:[{amount:50,price:'$0.99'},{amount:160,price:'$2.99',bonus:'+10%'},{amount:500,price:'$7.99',bonus:'+25%'},{amount:1400,price:'$19.99',bonus:'+40%'}],
 coins:[{amount:2000,gems:10},{amount:6000,gems:25},{amount:20000,gems:70}],
 energy:[{amount:50,gems:8},{amount:120,gems:16},{amount:150,gems:20}],
 chests:[{id:'Бронза',count:3,lvl:[1,3],coins:800},{id:'Серебро',count:4,lvl:[2,5],gems:12},{id:'Золото',count:5,lvl:[3,7],gems:28},{id:'Звёздный',count:6,lvl:[4,8],gems:60}]
};
const MAP_SPOTS=[
{id:'apart',x:30,y:60,lvl:1,ic:'🏠',ru:'Квартирка',en:'Apartment',ru2:'Первый дом Стефании в Голливуде.',en2:'Stefania’s first home in Hollywood.',img:'assets/map/loc_apart.webp'},
{id:'cafe',x:44,y:64,lvl:2,ic:'☕',ru:'Кафе на бульваре',en:'Boulevard cafe',ru2:'Здесь начинаются все важные разговоры.',en2:'Every important talk starts here.',img:'assets/map/loc_cafe.webp'},
{id:'park',x:36,y:74,lvl:3,ic:'🌴',ru:'Парк Палм',en:'Palm park',ru2:'Фонтан, пальмы и утренние пробежки.',en2:'A fountain, palms and morning runs.',img:'assets/map/loc_park.webp'},
{id:'boutique',x:79,y:66,lvl:5,ic:'👗',ru:'Модный квартал',en:'Fashion district',ru2:'Лучшие бутики города.',en2:'The best boutiques in town.',img:'assets/map/loc_boutique.webp'},
{id:'salon',x:70,y:45,lvl:6,ic:'💄',ru:'Салон красоты',en:'Beauty salon',ru2:'Тут рождается образ звезды.',en2:'Where a star look is born.',img:'assets/map/loc_salon.webp'},
{id:'studio',x:52,y:30,lvl:8,ic:'🎬',ru:'Киностудия',en:'Film studio',ru2:'Павильоны, камеры и первые роли.',en2:'Stages, cameras and first roles.',img:'assets/map/loc_studio.webp'},
{id:'theatre',x:63,y:54,lvl:10,ic:'🎭',ru:'Театр премьер',en:'Premiere theatre',ru2:'Красная дорожка и вспышки камер.',en2:'Red carpet and camera flashes.',img:'assets/map/loc_theatre.webp'},
{id:'mall',x:86,y:75,lvl:12,ic:'🛍️',ru:'Торговый центр',en:'Shopping mall',ru2:'Три этажа соблазнов и витрин.',en2:'Three floors of shiny temptation.',img:'assets/map/loc_mall.webp'},
{id:'jewel',x:89,y:57,lvl:14,ic:'💎',ru:'Ювелирный дом',en:'Jewelry house',ru2:'Бриллианты для красной дорожки.',en2:'Diamonds for the red carpet.',img:'assets/map/loc_jewel.webp'},
{id:'beach',x:20,y:85,lvl:16,ic:'🏖️',ru:'Океан',en:'Ocean',ru2:'Любимое место Стефании и Дамира.',en2:'Stefania and Damir’s favourite place.',img:'assets/map/loc_beach.webp'},
{id:'marina',x:8,y:60,lvl:18,ic:'⛵',ru:'Марина',en:'Marina',ru2:'Белые яхты и вечерние вечеринки.',en2:'White yachts and evening parties.',img:'assets/map/loc_marina.webp'},
{id:'rooftop',x:57,y:44,lvl:20,ic:'🍸',ru:'Крыша-бар',en:'Rooftop bar',ru2:'Весь город как на ладони.',en2:'The whole city at your feet.',img:'assets/map/loc_rooftop.webp'},
{id:'hills',x:92,y:33,lvl:22,ic:'🏡',ru:'Холмы',en:'The hills',ru2:'Вилла с видом на весь город.',en2:'A villa overlooking the city.',img:'assets/map/loc_hills.webp'},
{id:'sign',x:80,y:17,lvl:24,ic:'⭐',ru:'Знак Голливуда',en:'Hollywood sign',ru2:'Символ большой мечты.',en2:'The symbol of a big dream.',img:'assets/map/loc_sign.webp'},
{id:'awards',x:46,y:48,lvl:26,ic:'🏆',ru:'Зал наград',en:'Awards hall',ru2:'Сцена, где вручают статуэтки.',en2:'The stage where statuettes are given.',img:'assets/map/loc_awards.webp'},
{id:'airport',x:33,y:21,lvl:28,ic:'✈️',ru:'Частный аэропорт',en:'Private airport',ru2:'Джет до Парижа ждёт вас.',en2:'A jet to Paris is waiting.',img:'assets/map/loc_airport.webp'},
{id:'desert',x:12,y:29,lvl:30,ic:'🌵',ru:'Пустынные съёмки',en:'Desert set',ru2:'Натурные съёмки под палящим солнцем.',en2:'Location shooting under a hot sun.',img:'assets/map/loc_desert.webp'},
{id:'penthouse',x:68,y:34,lvl:33,ic:'🌃',ru:'Пентхаус',en:'Penthouse',ru2:'Ночной город прямо за стеклом.',en2:'The night city right behind the glass.',img:'assets/map/loc_penthouse.webp'},
{id:'lot',x:24,y:44,lvl:36,ic:'🏗️',ru:'Участок под студию',en:'Studio lot',ru2:'Здесь вырастет собственная студия.',en2:'Your own studio will rise here.',img:'assets/map/loc_lot.webp'}
];
const I18N={
 ru:{title:'Vasilwwq Merge',level:'Уровень',season:['Осень','Зима','Весна','Лето'],story:'История',map:'Карта',album:'Альбом',shop:'Магазин',quests:'Задания',event:'Ивент',sell:'Продать',storage:'Склад',questsTitle:'Ежедневные задания',settings:'Настройки',reset:'Сбросить прогресс',ok:'ОК',deliver:'Отдать',collect:'Забрать',play:'Играть',scene:'Сцена',reward:'Награда',levelUp:'Новый уровень',sceneDone:'Сцена пройдена',eventTitle:'Неделя моды',freeAd:'Бесплатно',adHint:'За просмотр рекламы',mapHint:'Нажимай на места на карте, чтобы их открыть.',noEnergy:'Не хватает энергии',noSpace:'Нет места на поле',notEnough:'Недостаточно средств',sold:'Продано',storageFull:'Склад полон',orderHint:'Не хватает предметов для заказа',newItem:'Новый предмет:',locked2:'Откроется на уровне',music:'Музыка',sfx:'Звуки',lang:'Язык',sellOn:'Режим продажи включён',sellOff:'Режим продажи выключен',resetAsk:'Сбросить весь прогресс?'},
 en:{title:'Vasilwwq Merge',level:'Level',season:['Autumn','Winter','Spring','Summer'],story:'Story',map:'Map',album:'Album',shop:'Shop',quests:'Quests',event:'Event',sell:'Sell',storage:'Storage',questsTitle:'Daily quests',settings:'Settings',reset:'Reset progress',ok:'OK',deliver:'Deliver',collect:'Claim',play:'Play',scene:'Scene',reward:'Reward',levelUp:'Level up',sceneDone:'Scene complete',eventTitle:'Fashion Week',freeAd:'Free',adHint:'Watch an ad',mapHint:'Tap the places on the map to unlock them.',noEnergy:'Not enough energy',noSpace:'No free space',notEnough:'Not enough currency',sold:'Sold',storageFull:'Storage is full',orderHint:'Missing items for this order',newItem:'New item:',locked2:'Unlocks at level',music:'Music',sfx:'Sound',lang:'Language',sellOn:'Sell mode on',sellOff:'Sell mode off',resetAsk:'Reset all progress?'}
};
