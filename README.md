config.js — загрузка dotenv, клиенты MongoDB и ClickHouse-реплики.

queue/queue.js — простая очередь на EventEmitter для буферизации событий.

listener/mongoChangeStream.js — слушатель Change Stream MongoDB, пушит события started/finished в очередь.

sync/initialSync.js — при старте «догоняет» все завершённые звонки и кладёт их в очередь.

worker/worker.js — батчит события finished, загружает данные из продового ClickHouse и помечает их в processed_calls.

loader/clickhouseLoader.js — для каждого callId и таблицы вытягивает данные из prod и вставляет в реплику.

utils/dateUtils.js, utils/logging.js — вспомогательные функции.

schemaMonitor.js — (опционально) логика мониторинга схемы из исходного кода.

index.js — точка входа, запускает initialSync, монитор схемы, ChangeListener и Worker.

package.json — зависимости и скрипт start.