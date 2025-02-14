(() => {
    window.onload = async function () {
      const chatConfig = {
        agentId: "5003048b-d91d-4318-b20a-8a1afcd759a1", // Ваш агент ID
      };
  
      await initializeChatWidget(chatConfig);
    };
  
    async function initializeChatWidget(config) {
      console.log("Инициализация чата...");
  
      // Загружаем библиотеку Markdown
      const markedScript = document.createElement("script");
      markedScript.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
      document.head.appendChild(markedScript);
      await new Promise((resolve) => (markedScript.onload = resolve));
  
      // Подключаем CSS стили
      document.head.appendChild(
        Object.assign(document.createElement("link"), {
          rel: "stylesheet",
          href: "https://app.nextbot.ru/styles.css",
        })
      );
  
      // HTML-структура виджета
      const chatWidgetHTML = `
          <div class="prefix_chat-icon">💬</div>
          <div class="prefix_chat-widget">    
              <div class="prefix_chat-header">
                <span class="prefix_header-text">NEXTBOT</span>
                <span class="prefix_close-icon">×</span>
              </div>
              <div class="prefix_chat-body">
                <div class="prefix_chat-messages"></div>
                  <div class="prefix_chat-input">
                    <div contenteditable="true" class="chat-input-content" placeholder="Введите ваше сообщение..." data-placeholder="Введите ваше сообщение...">Введите ваше сообщение...</div>
                    <button></button>
                  </div>
              </div>
          </div>
      `;
  
      // Добавляем виджет на страницу
      const chatContainer = document.createElement("div");
      chatContainer.id = "chatWidgetContainer";
      chatContainer.innerHTML = chatWidgetHTML;
      document.body.appendChild(chatContainer);
  
      // API URL
      const URL = "https://app.nextbot.ru";
  
      // Получаем элементы чата
      const chatWidget = document.querySelector(".prefix_chat-widget");
      const chatIcon = document.querySelector(".prefix_chat-icon");
      const closeIcon = document.querySelector(".prefix_close-icon");
      const chatMessages = document.querySelector(".prefix_chat-messages");
      const sendButton = document.querySelector(".prefix_chat-input button");
      const inputElem = document.querySelector(".prefix_chat-input .chat-input-content");
  
      let userId = localStorage.getItem("userId");
      if (!userId) {
        localStorage.setItem("userId", generateUUID());
        userId = localStorage.getItem("userId");
      }
  
      // Получаем данные виджета
      const { historyMessages, startMessage, widgetProperties } =
        await fetchInitialProperties(config.agentId, userId);
  
      if (historyMessages && historyMessages.length > 0) {
        historyMessages.forEach((msg) => {
          addMessageToChat(msg.content, msg.role);
        });
      } else {
        addMessageToChat(startMessage, "assistant");
      }
  
      // Настройки виджета
      setWidgetProperties(widgetProperties);
  
      function setWidgetProperties(properties) {
        if (properties.header_text) {
          document.querySelector(".prefix_header-text").textContent = properties.header_text;
        }
      }
  
      // Клики по иконке чата
      chatIcon.addEventListener("click", function () {
        chatIcon.style.display = "none";
        chatWidget.style.display = "block";
      });
  
      closeIcon.addEventListener("click", function () {
        chatWidget.style.display = "none";
        chatIcon.style.display = "flex";
      });
  
      // Отправка сообщений
      sendButton.addEventListener("click", async function () {
        const message = inputElem.textContent.trim();
        if (message) {
          addMessageToChat(message, "user");
          const response = await sendMessage(message, config);
          if (response?.content) {
            addMessageToChat(response.content, "assistant");
          }
        }
      });
  
      async function sendMessage(message, config) {
        const response = await fetch(`${URL}/api/widget/chat/${config.agentId}`, {
          headers: { "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify({ userId, messages: [{ role: "user", content: message }] }),
        });
        return response.ok ? await response.json() : console.error("Ошибка отправки сообщения:", response.statusText);
      }
  
      async function fetchInitialProperties(agentId, userId) {
        const response = await fetch(`${URL}/api/widget/init/${agentId}?userId=${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        return response.ok ? await response.json() : console.error("Ошибка получения данных:", response.statusText);
      }
  
      function addMessageToChat(message, role) {
        const messageElem = document.createElement("div");
        try {
          messageElem.innerHTML = marked.parse(message);
        } catch (error) {
          messageElem.textContent = message;
        }
        messageElem.classList.add("message", role);
        chatMessages.appendChild(messageElem);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
  
      function generateUUID() {
        return "yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
          var r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }
    }
  })();