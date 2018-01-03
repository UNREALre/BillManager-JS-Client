//Инициализируем
billManager.options = {
	bmURL: "https://185.14.30.1:1500/billmgr",
	errorContainerID: "error",
	sessionExpire: 30,
}

/*
billManager.registerUser(
	{//Данные для регистрации
		email: "testuser2@test.net",
		password: "hGb3294QsT",
		realname: "John Dow",
		phone: "+7 (987) 654-22-11",
		country_id: 182,
		project: 1,
		partner: "",
		lang: "ru"
	}, 
	function(data) {//Если что-то надо сделать после - пишем код тут. Приходит ID нового пользователя сюда
		console.log(data)
	}
);
*/

/*
//Если данные верные, пользователь будет авторизован в системе, в Локальном хранилище браузера будет сохранен ID сессии биллинга
billManager.authorizeUser("avpmanager99@gmail.com", "Alexander321");
*/

/*
//Получим: id, email, телефон, имя, временную зону пользователя
billManager.getUserInfo(function(data) {//Данные пользователя приходят сюда
	console.log(data)
});
*/

/*
//Получим: баланс пользователя с выбранной валютой биллинга и чистый баланс (одно число)
billManager.getUserBalance(function(data) {//Баланс пользователя приходит сюда
	console.log(data)
});
*/

//Получаем информацию по всем продуктам авторизованного пользователя с заданным кодом из биллинга (к примеру, soft)
billManager.getUserProducts("soft", function(data) {//Продукты пользователя приходят сюда
	console.log(data);
});