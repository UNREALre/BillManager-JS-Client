# BillManager-JS-Client
Клиентский модуль на JS, осуществляющий интеграцию сайта с BILLmanager. Библиотека упрощает работу по взаимодействию с биллингом для целого ряда операций (регистрация, авторизация, покупка и пр. - полный список ниже). К примеру, если стоит задача реализовать обёртку биллинга в виде лендинга, то данный функционал поможет это сделать довольно быстро.

## Установка
Для установки библиотеки необходимо:
* Подключить jQuery к проекту
* Подключить саму библиотеку billmanager.js

``` javascript
<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
<script src="billmanager.js"></script>
```

## Общие принципы работы
После подключения библиотеки первым делом необходимо сконфигурировать головной объект billManager, который и будет использовать во всей последующей работе.

``` javascript
billManager.options = {
	bmURL: "https://site.com/billmgr",
	sessionExpire: 30,
	failToProlongSession: function() {
		//будет вызвана, если сессия биллинга будет просрочена, а продлить ее не получится. тут можно описать те или иные действия
	}
}
```

В options передается URL биллинга, затем передается количество минут через которых биллинг считает сессию просроченной. Библиотека будет контролировать это значение и автоматически обновлять сессию по истечению времени. Наконец, трейти параметр это callback функция, которую вызовет библиотека, если продлить сессию не получится.

После этого мы можем обращаться ко всем доступным функциям с помощью конструкции: billManager.someFunction(). Для всех методов последним параметров должна идти callback функция, в которую библиотека будет передавать результаты выполнения запросов или пр. информацию, если таковая предусматривается. Так же в callback-е следует проверять на наличие свойства "error" у пришедшего объекта. Error может быть передан, если запрос в биллинг не вышел по тем или иным причинам, а так же в error будет содержаться текст ошибки, возвращаемый самим биллингом в случае её возникновения.

## Полный список доступных методов
1. Регистрация пользователя

``` javascript
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
	function(data) {Приходит ID нового пользователя
		console.log(data)
	}
);
```

2. Авторизация пользователя
``` javascript
//Передаем id пользователя, старый пароль, новый пароль
billManager.authorizeUser("avpmanager@gmail.com", "Alexander123", function(data){
	//действия после авторизации
});
```

3. Смена пароля
``` javascript
billManager.changePassword(13, "Alexander321", "Alexander123", function(data){
	//
});
```

4. Восстановление пароля
``` javascript
billManager.recoverPassword("avpmanager@gmail.com", function(data){
	//
});
```

5. Получить информацию о пользователе
``` javascript
//Получим: id, email, телефон, имя, временную зону пользователя
billManager.getUserInfo(function(data) {
	console.log(data)
});
```

6. Получение данных о балансе пользователя
``` javascript
//Получим: баланс пользователя с выбранной валютой биллинга и чистый баланс (одно число)
billManager.getUserBalance(function(data) {
	console.log(data)
});
```

7. Получение продуктов пользователя
``` javascript
//Получаем информацию по всем продуктам авторизованного пользователя с заданным кодом из биллинга (к примеру, soft/vds/и т.п.)
//Вторым параметром указывается массив доп. св-в, которые надо получить, по умолчанию возвращаются: id, наименование, цена, период, дата создания, дата истечения срока, статус услуги
//Третьим параметром указывается массив с ID аддонов информацию по которым необходимо получить
billManager.getUserProducts("vds", ["datacentername", "domain"], ["addon_13", "addon_15", "addon_9"], function(data) {
	console.log(data);
});
```

8. Дата и сумма ближайшего платежа для пользователя
``` javascript
//Первый параметр - по какому продукту искать ближайший платеж
billManager.getNextPaymentInfo("vds", function(data) {//Сюда придет объект со свойствами date и price
	console.log(data);
});
```

9. Получение информации по доступным продуктам в биллинге
``` javascript
//Получает всю информацию по продуктам по их id в биллинге. Первый параметр - массив id
billManager.getProductsInfo([1,8], function(data) {
	console.log(data);
});
```

10. Пополнение баланса пользователя
``` javascript
//Передаем сумму пополнения, валюту в iso, id валюты в биллинге, id платежной системы в биллинге, callback
//В callback придет URL на который надо перенаправить пользователя для осуществления платежа
billManager.addFundsToBalance(1000, "RUB", 126, 8, function(data){
	console.log(data);
});
```

11. Покупка продукта
``` javascript
//Первый аргумент объект, содержащий св-ва: product_code - код продукта из биллинга; product_id - id продукта из биллинга; period - период покупки; project - проект; addons - массив аддонов к продукту, если таковые есть, каждый элемент массива вида addon_X=Y, где X - Id аддона, Y - значения аддона;
//amount - сумма покупки; currency_iso - iso валюты; currency_id - id валюты из биллинга; paymethod - id платежной системы из биллинг.
//В callback придет URL на который надо перенаправить пользователя для оплаты заказа
billManager.buyProduct({
	product_code: "vds",
	product_id: 8,
	period: 1,
	project: 1,
	addons: ["addon_13=8192", "addon_15=10", "addon_9=260"],
	amount: 196,
	currency_iso: "USD",
	currency_bm_id: 153,
	paymethod: 8
}, function(data){
	console.log(data);
});
```

12. Получить все платежи пользователя
``` javascript
billManager.getUserPayments(function(data){
	console.log(data);
});
```