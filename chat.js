Module["onRuntimeInitialized"] = initChat;
if (typeof ENV === "undefined")
  initChat();

function chatboxAddMessage(msg, player, mapId, prevMapId, prevLocationsStr) {
  const messages = document.getElementById("messages");
  
  const shouldScroll = Math.abs((messages.scrollHeight - messages.scrollTop) - messages.clientHeight) <= 20;

  const msgContainer = document.createElement("div");
  msgContainer.classList.add("messageContainer");
  
  const message = document.createElement("span");
  message.classList.add("message");

  const messageContents = document.createElement("span");
  messageContents.classList.add("messageContents");

  let roleIcon;

  const system = player === undefined;
  const global = !system && mapId;

  if (!system) {
    if (global) {
      msgContainer.classList.add("global");
      msgContainer.appendChild(document.getElementsByTagName("template")[0].content.cloneNode(true));

      if (mapId !== "0000" && (localizedMapLocations || gameId === "2kki")) {
        const globalMessageIcon = msgContainer.children[0];
        const globalMessageLocation = document.createElement("small");

        if (gameId === "2kki" && (!localizedMapLocations || !localizedMapLocations.hasOwnProperty(mapId))) {
          const prevLocations = prevLocationsStr && prevMapId !== "0000" ? decodeURIComponent(window.atob(prevLocationsStr)).split("|").map(l => { return { title: l }; }) : null;
          set2kkiGlobalChatMessageLocation(globalMessageIcon, globalMessageLocation, mapId, prevMapId, prevLocations);
        } else {
          globalMessageIcon.title = getLocalizedMapLocations(mapId, prevMapId, "\n");
          globalMessageLocation.innerHTML = getLocalizedMapLocationsHtml(mapId, prevMapId, getInfoLabel("&nbsp;|&nbsp;"));
        }

        globalMessageLocation.classList.add("globalMessageLocation");
        if (!config.showGlobalMessageLocation)
          globalMessageLocation.classList.add("hidden");

        msgContainer.appendChild(globalMessageLocation);

        globalMessageIcon.classList.add("pointer");

        globalMessageIcon.onclick = function () {
          const locationLabel = this.nextElementSibling;
          locationLabel.classList.toggle("hidden");
          config.showGlobalMessageLocation = !locationLabel.classList.contains("hidden");
          updateConfig(config);
        };
      }
    }

    const name = document.createElement("span");
    name.classList.add("nameText");

    name.innerText = player?.name || localizedMessages.playerList.unnamed; // Shouldn't be null but add a fallback anyway
    const nameBeginMarker = document.createElement("span");
    nameBeginMarker.classList.add("nameMarker");
    nameBeginMarker.textContent = "<";
    const nameEndMarker = document.createElement("span");
    nameEndMarker.classList.add("nameMarker");
    nameEndMarker.textContent = ">";
    message.appendChild(nameBeginMarker);
    message.appendChild(name);
    if (player?.rank) {
      const rank = Math.min(player.rank, 3);
      message.appendChild(document.getElementsByTagName("template")[rank].content.cloneNode(true));
      roleIcon = message.children[message.childElementCount - 1];
      roleIcon.title = localizedMessages.roles[Object.keys(localizedMessages.roles)[rank - 1]];
    }

    let systemName = player?.systemName;

    if (systemName) {
      systemName = systemName.replace(/'/g, "");
      const parsedSystemName = systemName.replace(" ", "_");
      getFontColors(systemName, 0, colors => {
        name.setAttribute("style", `background-image: linear-gradient(to bottom, ${getGradientText(colors)}) !important`);
        if (roleIcon) {
          addSystemSvgGradient(systemName, colors);
          roleIcon.querySelector("path").style.fill = `url(#baseGradient_${parsedSystemName})`;
        }
      });
      getFontShadow(systemName, shadow => {
        name.style.filter = `drop-shadow(1.5px 1.5px ${shadow})`;
        if (roleIcon) {
          addSystemSvgDropShadow(systemName, shadow);
          roleIcon.querySelector("path").style.filter = `url(#dropShadow_${parsedSystemName})`;
        }
      });
    }
    
    message.appendChild(nameEndMarker);
    message.appendChild(document.createTextNode(" "));
  }
  
  populateMessageNodes(parseMessageTextForMarkdown(msg), messageContents, system);
  wrapMessageEmojis(messageContents);

  if (!messageContents.innerText.trim())
    messageContents.classList.add('notext');

  if (localizedMapLocations && !global) {
    const nonGlobalMessages = messages.querySelectorAll(".messageContainer:not(.global)");
    if (nonGlobalMessages.length) {
      const lastNonGlobalMessage = nonGlobalMessages[nonGlobalMessages.length - 1];
      if (lastNonGlobalMessage.classList.contains("locMessage"))
          lastNonGlobalMessage.classList.remove("hidden");
    }
  }
  
  message.appendChild(messageContents);
  msgContainer.appendChild(message);
  messages.appendChild(msgContainer);

  const chatbox = document.getElementById("chatbox");

  if (chatbox.classList.contains("map") && global)
    document.getElementById("chatTabGlobal").classList.add("unread");
  else if (chatbox.classList.contains("global") && !global)
    document.getElementById("chatTabMap").classList.add("unread");
  else if (!system && !document.querySelector(".chatboxTab.active[data-tab-section='chat']")) {
    const unreadMessageCountContainer = document.getElementById("unreadMessageCountContainer");
    const unreadMessageCountLabel = document.getElementById("unreadMessageCountLabel");
    if (unreadMessageCountContainer.classList.contains("hidden")) {
      unreadMessageCountLabel.textContent = "0";
      unreadMessageCountContainer.classList.remove("hidden");
    }
    let unreadMessageCount = parseInt(unreadMessageCountLabel.textContent);
    if (!unreadMessageCount || unreadMessageCount < 9)
      unreadMessageCountLabel.textContent = ++unreadMessageCount < 9 ? unreadMessageCount : `${unreadMessageCount}+`;
  }

  if (shouldScroll)
    messages.scrollTop = messages.scrollHeight;

  return msgContainer;
}

function chatInputActionFired() {
  if (connStatus !== 1)
    return;
  const chatInput = document.getElementById("chatInput");
  if (chatInput.value === "")
    return;
  const chatTab = document.querySelector(".chatboxTab[data-tab-section='chat']");
  if (!chatTab.classList.contains("active"))
    chatTab.click();
  const msgPtr = Module.allocate(Module.intArrayFromString(chatInput.value.trim()), Module.ALLOC_NORMAL);
  if (!chatInput.dataset.global || document.getElementById("chatboxContainer").classList.contains("hideGlobal"))
    Module._SendChatMessageToServer(msgPtr);
  else {
    const chatInputContainer = document.getElementById("chatInputContainer");
    if (!chatInputContainer.classList.contains("globalCooldown")) {
      Module._SendGChatMessageToServer(msgPtr);
      chatInput.disabled = true;
      chatInput.blur();
      chatInputContainer.classList.add("globalCooldown");
      window.setTimeout(function () {
        chatInputContainer.classList.remove("globalCooldown");
        chatInput.disabled = false;
      }, 15000);
    }
  }
  Module._free(msgPtr);
  chatInput.value = "";
}

function chatNameCheck() {
  const nameInput = document.getElementById("nameInput");
  if (nameInput.value == "") return;
  if (!(/^[A-Za-z0-9]+$/.test(nameInput.value)))
    return;
  document.getElementById("enterNameContainer").style.display = "none";
  document.getElementById("chatInput").disabled = false;
  document.getElementById("chatInputContainer").setAttribute("style", "");
  updateYnomojiContainerPos();
  playerName = nameInput.value;
  if (playerData[-1])
    playerData[-1].name = playerName;
  addOrUpdatePlayerListEntry(systemName, playerName, -1);
  ptr = Module.allocate(Module.intArrayFromString(playerName), Module.ALLOC_NORMAL);
  Module._ChangeName(ptr);
  Module._free(ptr);
  nameInput.value = "";
}

function initChat() {
  document.getElementById("chatboxContainer").style.display = "table-cell";
}

function addChatTip() {
  const tips = localizedMessages.chatTips.tips;
  if (++globalConfig.chatTipIndex >= Object.keys(tips).length)
    globalConfig.chatTipIndex = 0;
  const tipIndex = globalConfig.chatTipIndex;
  chatboxAddMessage(getMassagedLabel(localizedMessages.chatTips.template.replace("{CONTENT}", tips[Object.keys(tips)[tipIndex]])));
  updateConfig(globalConfig, true);
}

function addChatMapLocation() {
  const locationHtml = cached2kkiLocations
    ? getLocalized2kkiLocations(cached2kkiLocations, "&nbsp;|&nbsp;")
    : getLocalizedMapLocations(cachedMapId, cachedPrevMapId, "&nbsp;|&nbsp;");

  const locMessages = document.getElementById("messages").querySelectorAll(".messageContainer.locMessage");
  let lastLocMessage = locMessages.length ? locMessages[locMessages.length - 1] : null;
  if (lastLocMessage?.classList.contains("hidden")) {
    lastLocMessage.remove();
    lastLocMessage = locMessages.length > 1 ? locMessages[locMessages.length - 2] : null;
  }
  
  if (lastLocMessage && new DOMParser().parseFromString(locationHtml, "text/html").documentElement.textContent === lastLocMessage.innerText)
    return;

  const locMessage = chatboxAddMessage(locationHtml);
  if (locMessage) {
    locMessage.classList.add("locMessage");
    locMessage.classList.add("map");
    locMessage.classList.add("hidden");
  }
}

function markMapUpdateInChat() {
  const messages = document.getElementById("messages");
  const allTabMessageContainers = messages.querySelectorAll(".messageContainer:not(.map)");
  const mapTabMessageContainers = messages.querySelectorAll(".messageContainer:not(.global)");
  
  if (allTabMessageContainers.length) {
    const allTabLocMessages = messages.querySelectorAll("lastAllTabMessageInLoc");
    if (!allTabLocMessages.length)
      allTabMessageContainers[allTabMessageContainers.length - 1].classList.add("lastAllTabMessageInLoc");
  }
  if (mapTabMessageContainers.length) {
    const mapTabLocMessages = messages.querySelectorAll("lastMapTabMessageInLoc");
    if (!mapTabLocMessages.length)
      mapTabMessageContainers[mapTabMessageContainers.length - 1].classList.add("lastMapTabMessageInLoc");
  }
}

function parseMessageTextForMarkdown(msg) {
  const replacements = [
    { p: /<\/?[bisu] *>/ig, r: '' },
    { p: /(?:^|([^\\]))(\*{3,})([^\*\_\~\\]+)\2/g, r: '$1<b><i>$3</i></b>' },
    { p: /(?:^|([^\\]))(\*{2})([^\*\_\~\\]+)\2/g, r: '$1<b>$3</b>' },
    { p: /(?:^|([^\\]))\*([^\*\_\~\\]+)\*/g, r: '$1<i>$2</i>' },
    { p: /(?:^|([^\\]))(\_{3,})([^\*\_\~\\]+)\2(?= |$)/g, r: '$1<u><i>$3</i></u>' },
    { p: /(?:^|([^\\]))(\_{2})([^\*\_\~\\]+)\2(?= |$)/g, r: '$1<u>$3</u>' },
    { p: /(?:^|([^\\]))\_([^\*\_\~\\]+)\_(?= |$)/g, r: '$1<i>$2</i>' },
    { p: /(?:^|([^\\]))(\~{2,})([^\*\_\~\\]+)\2/g, r: '$1<s>$3</s>' },
    { p: /\\\*/g, r: '*' },
    { p: /\\\_/g, r: '_' },
    { p: /\\\~/g, r: '~' },
  ];
  for (let e of replacements)
    msg = msg.replace(e.p, e.r);

  return msg;
}

function populateMessageNodes(msg, node, asHtml) {
  const tagPattern = /<([bisu])>(.*?)<\/\1>/;
  let cursor = 0;
  let result;

  while ((result = tagPattern.exec(msg.slice(cursor)))) {
    if (result.index) {
      const content = msg.slice(cursor, cursor + result.index);
      let textNode;
      if (asHtml) {
        textNode = document.createElement("span");
        textNode.innerHTML = content;
      } else
        textNode = document.createTextNode(content);
      node.appendChild(textNode);
    }
    const childNode = document.createElement(result[1]);
    const innerMsg = msg.substr(cursor + result.index + 3, result[2].length);
    populateMessageNodes(innerMsg, childNode, asHtml);
    node.appendChild(childNode);
    cursor += result.index + result[2].length + 7;
  }

  if (cursor < msg.length) {
    const content = msg.slice(cursor);
    let textNode;
    if (asHtml) {
      textNode = document.createElement("span");
      textNode.innerHTML = content;
    } else
      textNode = document.createTextNode(content);
    node.appendChild(textNode);
  }
}

function wrapMessageEmojis(node, force) {
  if (node.childNodes.length && !force) {
    for (let childNode of node.childNodes) {
      if (/\p{Extended_Pictographic}/u.test(childNode.textContent) || /:([a-z0-9\_\-]+):/i.test(childNode.textContent)) {
        if (childNode.nodeType === Node.TEXT_NODE) {
          const newChildNode = document.createElement("span");
          newChildNode.innerText = childNode.textContent;
          node.replaceChild(newChildNode, childNode);
          wrapMessageEmojis(newChildNode, true);
        } else
          wrapMessageEmojis(childNode);
      }
    }
  } else {
    node.innerHTML = node.innerHTML.replace(/(\p{Extended_Pictographic}+)/ug, '<span class="emoji">$1</span>');
    const ynomojiPattern = /:([a-z0-9\_\-]+):/gi;
    let ynomojiMatch;
    while (ynomojiMatch = ynomojiPattern.exec(node.innerHTML)) {
      const ynomojiId = Object.keys(ynomojiConfig).find(id => id === ynomojiMatch[1]);
      if (ynomojiId)
        node.innerHTML = `${node.innerHTML.slice(0, ynomojiMatch.index)}<span class="ynomojiWrapper"><img src="${ynomojiConfig[ynomojiId]}" class="ynomoji" title="${ynomojiId}" /></span>${node.innerHTML.slice(ynomojiMatch.index + ynomojiId.length + 2)}`;
    }
  }
}

// EXTERNAL
function onChatMessageReceived(msg, id) {
  const player = playerData[id] || null;
  chatboxAddMessage(msg, player);
}

// EXTERNAL
function onGChatMessageReceived(uuid, mapId, prevMapId, prevLocationsStr, msg) {
  const player = globalPlayerData[uuid] || null;
  chatboxAddMessage(msg, player, mapId, prevMapId, prevLocationsStr);
}