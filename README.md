<div style = "font-family: 'Open Sans', sans-serif; font-size: 16px">

# ModuleProcess
<p align="center">
  <img src="./res/logo.png" width="400" title="hover text">
</p>

-----------------

# Лицензия
////

# Описание
<div style = "color: #555">

Модуль предназначен для инициализации платформы, загрузки модулей, необходимых для функционирования системы, подключению к сети и инициализация часов. Запуск модуля осущетвляется при включении платформы автоматически. Такое поведение обеспечено особенностью среды Espruino: js-код в  файле с именем *.boot0*, находящимся во flash-памяти платформы, будет выполнен автоматически при запуске. Такеж для инициализации и работы с платформой модулю взаимодействует с тремя конфигурацонными файлами. Файл *init.conf* содержит имя-идентификатор платформы, часовой пояс по-умолчанию и имена файлов базовых модулей, запуск которых осуществляется Process. **Без этого файла система не запуститься!**. Файл *device.conf* содержит информацию о датчиках и актуаторах, отсортированную по запускаемым пользовательским программам. Модуль взаимодействует с этим файлом по запросу SensorManager, но без этого конфигурационного файла **система не запустится!**. Файл *network.conf* содержит конфигурацию сетевого взаимодействия, например список сетей, к которым осуществлять автоматическое подключение. Без этого файла система запустится, но автоматического подключения к сети WiFi осуществлено не будет. Модуль имеет следующие архитектурные решения:
- реализует паттерн синглтон.
</div>

### Конструктор
<div style = "color: #555">
Конструктор не принимает никаких значений. При создании объекта происходят проверки на наличие модуля Storage - модуль Espruino, позволяющий работать с файлами, находящимися во Flash-памяти, инициализирует поле-объект для работы с файлами, проверяет наличие файлов конфигурации, а также определяется запускаемая программа. Пример создания объекта:
```js
let Process = new (require("ModuleProcess.min.js"))();
```
</div>

### Поля
<div style = "color: #555">

- <mark style="background-color: lightblue">_FileReader</mark> - объект класса Storage, используется для работы с файлами;
- <mark style="background-color: lightblue">_LoadFile</mark> - имя загруженной программы, используется для корректной нафигации по файлу device.conf;
- <mark style="background-color: lightblue">_RTC</mark> - объект класса RTC, хранит объект для работы с часами реального фремени;
- <mark style="background-color: lightblue">_Wifi</mark> - объект класса WiFi, хранит объект, реализующий сетевое взаимодействие платформы;
- <mark style="background-color: lightblue">_HaveWifi</mark> - флаг, показывающий факт подключения к сети WiFi;
- <mark style="background-color: lightblue">_BoardID</mark> - полное имя экземпляра платформы, включая заводской номер и имя, присвоенное в файле init.conf;
- <mark style="background-color: lightblue">_TimeZone</mark> - часовая зона, установленная на платформе (плюс или минус в часах от GMT).
</div>

### Методы
<div style = "color: #555">

- <mark style="background-color: lightblue">Run()</mark> - запуск основного цикла модуля, здесь происходит инициализация зависимых модулей, инициализация часов и подключение к WiFi;
- <mark style="background-color: lightblue">GetAppName()</mark> - возвращает имя запущенной программы для поиска конфигурации в device.conf;
- <mark style="background-color: lightblue">GetBoardName()</mark> - возвращает имя платформы, записанное в поле _BoardID;
- <mark style="background-color: lightblue">GetDeviceConfig(id)</mark> - возвращает конфигурацию датчика или актуатора из device.conf по его ID;
- <mark style="background-color: lightblue">GetBusesConfig()</mark> - возвращает конфигурацию шин из device.conf текущей запущенной программы;
- <mark style="background-color: lightblue">GetMQTTClientConfig()</mark> - возвращает конфигурацию MQTT-клиента;
- <mark style="background-color: lightblue">SetSystemTime()</mark> - устанавливает время на платформе ина подключенных часах, если такие найдены и описаны в конфигурационном файле;
- <mark style="background-color: lightblue">CheckSystemTime()</mark> - проверка на адекватность установленного в системе времени;
- <mark style="background-color: lightblue">GetModuleIdByName(_name)</mark> - находит в конфигурационном файле ID сенсора или актуатора по его имени;
- <mark style="background-color: lightblue">GetSystemTime()</mark> - возвращает время, установленное на платформе в виде строки;
- <mark style="background-color: lightblue">IsProgramInConfig(filename)</mark> - возвращает true, если в device.conf существует конфигурация для запускаемой программы;
- <mark style="background-color: lightblue">GetSuccessString(moduleName)</mark> - возвращает строку об успехе с именем модуля для логгера;
- <mark style="background-color: lightblue">GetFailString(moduleName, fileName)</mark> - возвращает строку об ошибке с именем модуля для логгера, заранее определив, присутствует-ли модуль во flash-памяти.
</div>

### Примеры
<div style = "color: #555">

Создание объекта Process в файле .boot0.Предполагается, что все необходимые модули уже загружены в систему:
```js
let Process = new (require("ModuleProcess.min.js"))();
Process.Run();
```
Вывод при запуске системы в консоль:
<p align="left">
  <img src="./res/output.png" title="hover text">
</p>
</div>

# Зависимости
- [ModuleLogger](https://github.com/Konkery/ModuleLogger/blob/main/README.md)
- [ModuleAppError](https://github.com/Konkery/ModuleAppError/blob/main/README.md)
- [ModuleAppMath](https://github.com/Konkery/ModuleAppMath/blob/main/README.md)
- [ModuleI2CBus](https://github.com/Konkery/ModuleI2CBus/blob/main/README.md)
- [ModuleSPIBus](https://github.com/Konkery/ModuleSPIBus/blob/main/README.md)
- [ModuleUARTBus](https://github.com/Konkery/ModuleUARTBus/blob/main/README.md)
- [ModuleActuator](https://github.com/Konkery/ModuleActuator/blob/main/README.md)
- [ModuleSensor](https://github.com/Konkery/ModuleSensor/blob/main/README.md)
- [ModuleSensorManager](https://github.com/Konkery//blob/main/README.md)
</div>
