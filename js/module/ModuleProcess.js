/**
 * Константы
 */
// Конфигурационные файлы
STORAGE = 'Storage';
WIFI = 'Wifi';
MAIN_CONFIG = 'init.conf';
DEVICE_CONFIG = 'device.conf';
NETWORK_CONFIG = 'network.conf';
MQTT_CONFIG = 'MQTTClientConfig.json';

// Ноды
BUS_NODE = 'bus';
RTC_NODE = 'RTC';
MODULES_NODE = 'modules';
DEFAULT_FILE = '.bootcde';

// Имена в глобальной видимости
LOGGER_NAME = 'Logger';
ERROR_NAME = 'ClassAppError';
MATH_NAME = 'ClassAppMath';
I2C_NAME = 'I2Cbus';
SPI_NAME = 'SPIbus';
UART_NAME = 'UARTbus';
ACTUATOR_NAME = 'ClassActuator';
SENSOR_NAME = 'ClassSensor';
ARCHITECT_NAME = 'SensorManager';
WIFI_NAME = 'Network';

// Сообщения
MSG_BOOTUP_SUCCESS = 'Boot up sequence complete!';
MSG_RTC_SUCCESS = 'System time is set via RTC clock module';
MSG_RTC_ADJUSTED = 'Date of RTC clock module adjusted';
MSG_RTC_NOT_FOUND = 'RTC clock not found!';
MSG_TIME_SET_FAIL = 'Failed to properly set system time!';
MSG_TIME_SET_SUCCESS = 'System time set to';
MSG_MODULE_LOADED = 'loaded.';
MSG_MODULE_NOT_FOUND = 'not found!'
MSG_WIFI_STARTUP = 'Starting up Network. . .'
MSG_WIFI_CONNECTED = 'Connected! IP: ';
MSG_WIFI_ERROR = 'Failed to start up WiFi! :: ';
MSG_BOARD_ID = 'Board ID:';
MSG_LOAD_FILE = 'LoadFile set to:';
MSG_EMPTY = '';

MSG_FATAL_CANT_FIND = 'FATAL ERROR>> Cannot find';
MSG_FATAL_MODULES = 'modules to load';

TS_JAN_FIRST_2000 = 943920000;
TS_JAN_FIRST_2100 = 4099680000;


/**
 * @class
 * Модуль Process реализует функционал, необходимый при старте платформы
 */
class ClassProcess {
    /**
     * @constructor
     */
    constructor() {
        if (!process.env.MODULES.includes(STORAGE))
            throw `${MSG_FATAL_CANT_FIND} ${STORAGE}`;

    /** Board name and identifications */
        this._FileReader = require(STORAGE);
        if (!(this._FileReader.list().includes(MAIN_CONFIG)))
            throw `${MSG_FATAL_CANT_FIND} ${MAIN_CONFIG}`;

        if (!(this._FileReader.list().includes(DEVICE_CONFIG)))
            throw `${MSG_FATAL_CANT_FIND} ${DEVICE_CONFIG}`;
        
        this._LoadFile = this.GetAppName();
        if (!this.IsProgramInConfig(this._LoadFile)) {
            throw `${MSG_FATAL_CANT_FIND} ${this._LoadFile}`;
        }
        this._RTC = undefined;
        this._Wifi = undefined;
        this._HaveWiFi = false;
    }
    Run() {
        // Read mods names
        let mods = this._FileReader.readJSON(MAIN_CONFIG, true)[MODULES_NODE];
        if (!mods) { throw `${MSG_FATAL_CANT_FIND} ${MSG_FATAL_MODULES}`;}

        let Logger;
        try {// Logger
            Logger = new (require(mods[LOGGER_NAME]))();
            Object.defineProperty(global, LOGGER_NAME, ({
                get: () => Logger
            }));
            Logger.Log(Logger.LogLevel.INFO, this.GetSuccessString(LOGGER_NAME));
        }
        catch (e) {
            Logger = {
                Log: (lvl, msg) => { console.log(msg);}
            };
            Logger.Log(Logger.LogLevel.WARN, this.GetFailString(LOGGER_NAME, mods[LOGGER_NAME]));
        }
        
        this._BoardID = `${process.env.BOARD} ${process.env.SERIAL} ${this._FileReader.readJSON(MAIN_CONFIG, true).name || MSG_EMPTY}`;
        this._TimeZone = (this._FileReader.readJSON(MAIN_CONFIG, true).timezone || 0);
        
        Logger.Log(Logger.LogLevel.INFO, `${MSG_BOARD_ID} ${this._BoardID}`);        
        Logger.Log(Logger.LogLevel.INFO, `${MSG_LOAD_FILE} ${this._LoadFile}`);
        

    /** Basic modules */
        try {// Error module
            const ClassAppError = require(mods[ERROR_NAME]);
            Object.defineProperty(global, ERROR_NAME, ({
                get: () => ClassAppError
            }));
            Logger.Log(Logger.LogLevel.INFO, this.GetSuccessString(ERROR_NAME));
        }
        catch (e) {
            Logger.Log(Logger.LogLevel.WARN, this.GetFailString(ERROR_NAME, mods[ERROR_NAME]));
        }

        try {// Math module
            const AppMath = require(mods[MATH_NAME]);
            Object.defineProperty(global, MATH_NAME, ({
                get: () => AppMath
            }));
            AppMath.is();
            Logger.Log(Logger.LogLevel.INFO, this.GetSuccessString(MATH_NAME));
        }
        catch (e) {
            Logger.Log(Logger.LogLevel.WARN, this.GetFailString(MATH_NAME, mods[MATH_NAME]));
        }

    /** Bus modules */
        try {// I2C
            const I2Cbus = new (require(mods[I2C_NAME]))();
            Object.defineProperty(global, I2C_NAME, ({
                get: () => I2Cbus
            }));
            Logger.Log(Logger.LogLevel.INFO, this.GetSuccessString(I2C_NAME));
        }
        catch (e) {
            Logger.Log(Logger.LogLevel.WARN, this.GetFailString(I2C_NAME, mods[I2C_NAME]));
        }

        try {// SPI
            const SPIbus = new (require(mods[SPI_NAME]))();
            Object.defineProperty(global, SPI_NAME, ({
                get: () => SPIbus
            }));
            Logger.Log(Logger.LogLevel.INFO, this.GetSuccessString(SPI_NAME));
        }
        catch (e) {
            Logger.Log(Logger.LogLevel.WARN, this.GetFailString(SPI_NAME, mods[SPI_NAME]));
        }

        try {// UART
            const UARTbus = new (require(mods[UART_NAME]))();
            Object.defineProperty(global, UART_NAME, ({
                get: () => UARTbus
            }));
            Logger.Log(Logger.LogLevel.INFO, this.GetSuccessString(UART_NAME));
        }
        catch (e) {
            Logger.Log(Logger.LogLevel.WARN, this.GetFailString(UART_NAME, mods[UART_NAME]));
        }

    /** Tech modules*/
        try {// Actuators
            const ClassActuator = require(mods[ACTUATOR_NAME]);
            Object.defineProperty(global, ACTUATOR_NAME, ({
                get: () => ClassActuator
            }));
            Logger.Log(Logger.LogLevel.INFO, this.GetSuccessString(ACTUATOR_NAME));
        }
        catch (e) {
            Logger.Log(Logger.LogLevel.WARN, this.GetFailString(ACTUATOR_NAME, mods[ACTUATOR_NAME]));
        }
    
        try {// Sensors
            const ClassSensor = require(mods[SENSOR_NAME]);
            Object.defineProperty(global, SENSOR_NAME, ({
                get: () => ClassSensor
            }));
            Logger.Log(Logger.LogLevel.INFO, this.GetSuccessString(SENSOR_NAME));
        }
        catch (e) {
            Logger.Log(Logger.LogLevel.WARN, this.GetFailString(SENSOR_NAME, mods[SENSOR_NAME]));
        }

        try {// Architect
            const SensorManager = new (require(mods[ARCHITECT_NAME]))();
            Object.defineProperty(global, ARCHITECT_NAME, ({
                get: () => SensorManager
            }));
            Logger.Log(Logger.LogLevel.INFO, this.GetSuccessString(ARCHITECT_NAME));
        }
        catch (e) {
            Logger.Log(Logger.LogLevel.WARN, this.GetFailString(ARCHITECT_NAME, mods[ARCHITECT_NAME]));
        }

    /** Internet connection and system time*/
        if (!(this._FileReader.list().includes(NETWORK_CONFIG))) {
            Logger.Log(Logger.LogLevel.ERROR, this.GetFailString(WIFI_NAME, NETWORK_CONFIG));
            this.SetSystemTime();
            this.CheckSystemTime();
            Logger.Log(Logger.LogLevel.INFO, MSG_BOOTUP_SUCCESS);
        }
        else {
            Logger.Log(Logger.LogLevel.INFO, MSG_WIFI_STARTUP);
            let netconf = this._FileReader.readJSON(NETWORK_CONFIG, true);
            try {
                if (process.env.MODULES.includes(WIFI)) {                   
                    this._Wifi = new (require(mods[WIFI_NAME]))();
                    this._Wifi.Init(netconf, undefined, () => {
                        this._HaveWiFi = true;
                        Logger.Log(Logger.LogLevel.INFO, MSG_WIFI_CONNECTED + this._Wifi._Ip);
                        this.SetSystemTime();
                        this.CheckSystemTime();
                        Logger.Log(Logger.LogLevel.INFO, MSG_BOOTUP_SUCCESS);
                    });              
                }
                else {
                    let wfbus = netconf.wifibus;
                    let bus = UARTbus._UARTbus[wfbus.index].IDbus;
                    bus.setup(wfbus.baudrate);
                    this._Wifi = new (require(mods[WIFI_NAME]))();
                    this._Wifi.Init(netconf, bus, () => {
                        this._HaveWiFi = true;
                        Logger.Log(Logger.LogLevel.INFO, MSG_WIFI_CONNECTED + this._Wifi._Ip);
                        this.SetSystemTime();
                        this.CheckSystemTime();
                        Logger.Log(Logger.LogLevel.INFO, MSG_BOOTUP_SUCCESS);
                    });
                }
            }
            catch (e) {
                Logger.Log(Logger.LogLevel.ERROR, MSG_WIFI_ERROR + e);
                this.SetSystemTime();
                this.CheckSystemTime();
                Logger.Log(Logger.LogLevel.INFO, MSG_BOOTUP_SUCCESS);
            }
        }
    }
    /**
     * @method
     * Возвращает название исполняемой программы.
     * @returns 
     */
    GetAppName() {
        try {
            return __FILE__;
        } catch (e) {
            return DEFAULT_FILE;
        }
    }
    /**
     * @method
     * Возвращает имя платы
     * @returns {String}  - имя платы
     */
    GetBoardName() {
        return this._BoardID;
    }
    /**
     * @method
     * Возвращает конфиг сенсора/актуатора по его id. 
     * @param {String} id 
     * @returns 
     */
    GetDeviceConfig(id) {
        return (((this._FileReader.readJSON(DEVICE_CONFIG, true) || {})[this._LoadFile]) || {})[id];
    }
    /**
     * @method
     * Возвращает объект с настройками для всех шин в проекте.
     * @returns {Object}
     */
    GetBusesConfig(){
        return this._FileReader.readJSON(DEVICE_CONFIG, true)[this._LoadFile][BUS_NODE];
    }
    /**
     * @method 
     * Выполняет чтение json-конфига, хранящего подписки на службы и соответствующие этим подпискам MQTT-топики.
     * @returns {Object}
     */
    GetMQTTClientConfig() {
        return this._FileReader.readJSON(MQTT_CONFIG, true)[this._LoadFile];
    }
    /**
     * @method
     * Устанавливает время системы и/через датчик RTC
     */
    SetSystemTime() {
        try {
            this._RTC = SensorManager.CreateDevice(this.GetModuleIdByName(RTC_NODE));
            let ts = this._RTC[0]._ThisSensor.GetTimeUnix();

            if (ts <= TS_JAN_FIRST_2000 || ts >= TS_JAN_FIRST_2100) {
                Logger.Log(Logger.LogLevel.WARN, MSG_RTC_NOT_FOUND);
            }
            else {
                let sys_t = Math.floor(new Date().getTime() / 1000);
                if (sys_t <= TS_JAN_FIRST_2000 || sys_t >= TS_JAN_FIRST_2100) {
                    setTime(ts);
                    this._RTC[0].Start(1000);
                    E.setTimeZone(this._TimeZone);
                    Logger.Log(Logger.LogLevel.INFO, MSG_RTC_SUCCESS);
                }
                else {
                    this._RTC[0]._ThisSensor.SetTime(new Date());
                    this._RTC[0].Start(1000);
                    E.setTimeZone(this._TimeZone);
                    Logger.Log(Logger.LogLevel.INFO, MSG_RTC_ADJUSTED);
                }
            }
        }
        catch (e) {
            Logger.Log(Logger.LogLevel.WARN, MSG_RTC_NOT_FOUND);
        }
    }
    /**
     * @method
     * Проверяет валидность установленного системного времени
     */
    CheckSystemTime() {
        let final_t_check = Math.floor(new Date().getTime() / 1000);
        if (final_t_check <= TS_JAN_FIRST_2000 || final_t_check >= TS_JAN_FIRST_2100) {
            Logger.Log(Logger.LogLevel.WARN, MSG_TIME_SET_FAIL);
        }
        else {
            Logger.Log(Logger.LogLevel.INFO, `${MSG_TIME_SET_SUCCESS} ${this.GetSystemTime()}`);
        }
    }
    /**
     * @method
     * Возвращает ID модуля из конфигурации по имени
     * @param {String} _name - имя модуля
     */
    GetModuleIdByName(_name) {
        let conf = this._FileReader.readJSON(DEVICE_CONFIG, true)[this._LoadFile];
        let arr = Object.keys(conf);
        let res;

        for (let i = 0; i < arr.length; i++) {
            if (conf[arr[i]].name == _name) {
                res = arr[i];
                break;
            }
        }

        return res;
    }
    /**
     * @method
     * Возвращает дату и время системы в определённом формате
     * @returns {String} 
     */
    GetSystemTime() {
        let date = new Date();
        return (date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).substr(-2) +
          "-" + ("0" + date.getDate()).substr(-2) + " " + ("0" + date.getHours()).substr(-2) +
          ":" + ("0" + date.getMinutes()).substr(-2) + ":" + ("0" + date.getSeconds()).substr(-2));
    }
    /**
     * @method
     * Возвращает true, если в конфигурации присутствует указанный файл
     * @param {String} filename - имя проверяемой программы
     * @returns {Boolean} result 
     */
    IsProgramInConfig(filename) {
        return Boolean(this._FileReader.readJSON(DEVICE_CONFIG, true)[filename]);
    }
    /**
     * @method
     * Возвращает строку для логгера в случае усепеха
     * @param {String} moduleName - имя модуля
     * @returns {String} res
     */
    GetSuccessString(moduleName) {
        return `${moduleName} ${MSG_MODULE_LOADED}`;
    }
     /**
     * @method
     * Возвращает строку для логгера в случае провала
     * @param {String} moduleName - имя модуля
     * @param {String} fileName - имя файла
     * @returns {String} res
     */
     GetFailString(moduleName, fileName) {
        return `${moduleName}: ${fileName} ${MSG_MODULE_NOT_FOUND}`;
    }
}


exports = ClassProcess;