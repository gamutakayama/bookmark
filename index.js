const debounce = (callback, wait) => {
  let timeoutId = null;

  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
};

const search = debounce((value) => {
  while (groupsElement.firstChild) {
    groupsElement.removeChild(groupsElement.lastChild);
  }

  const keyword = value.toLowerCase();
  if (keyword) {
    const bookmarks = Object.values(data)
      .flat()
      .filter((bookmark) => {
        return (
          bookmark.name.toLowerCase().includes(keyword) ||
          decodeURIComponent(bookmark.url).toLowerCase().includes(keyword)
        );
      });
    createGroupElement("", bookmarks);
  } else {
    for (const [name, bookmarks] of Object.entries(data)) {
      createGroupElement(name, bookmarks);
    }
  }
}, 250);

const searchElement = document.getElementById("search");
const searchClearElement = document.getElementById("search-clear");

searchElement.addEventListener("input", (e) => {
  if (e.target.isComposing) {
    return;
  }

  search(e.target.value);
  if (e.target.value) {
    searchClearElement.classList.add("visible");
  } else {
    searchClearElement.classList.remove("visible");
  }
});
searchElement.addEventListener("compositionstart", (e) => {
  e.target.isComposing = true;
});
searchElement.addEventListener("compositionend", (e) => {
  e.target.isComposing = false;
  e.target.dispatchEvent(new CustomEvent("input"));
});

searchClearElement.addEventListener("click", () => {
  searchElement.focus();
  searchElement.select();
  if (!document.execCommand("delete", false)) {
    searchElement.setRangeText("");
  }

  search("");
  searchClearElement.classList.remove("visible");
});

const groupsElement = document.getElementById("groups");

const createGroupElement = (name, bookmarks) => {
  const groupElement = document.createElement("section");
  groupElement.classList.add("group");

  if (name) {
    const nameElement = document.createElement("h3");
    nameElement.classList.add("group-name", "text-shadow");
    nameElement.innerText = name;
    groupElement.appendChild(nameElement);
  }

  const gridElement = document.createElement("div");
  gridElement.classList.add("group-grid");
  for (const bookmark of bookmarks) {
    gridElement.appendChild(createBookmarkElement(bookmark));
  }
  groupElement.appendChild(gridElement);

  groupsElement.appendChild(groupElement);
};

const createBookmarkElement = (bookmark) => {
  const bookmarkElement = document.createElement("a");
  bookmarkElement.classList.add("bookmark");
  if (bookmark.url) {
    bookmarkElement.href = bookmark.url;
    bookmarkElement.rel = "nofollow noopener noreferrer";
    bookmarkElement.target = "_blank";

    bookmarkElement.addEventListener("click", (e) => {
      e.preventDefault();

      chrome.windows.getCurrent((win) => {
        chrome.tabs.create({ url: bookmark.url, windowId: win.id });
      });
    });
  }

  const backgroundElement = document.createElement("div");
  backgroundElement.classList.add("bookmark-background");
  if (bookmark.background) {
    backgroundElement.style.background = bookmark.background;
  }
  bookmarkElement.appendChild(backgroundElement);

  let iconElement;
  if (bookmark.iconify) {
    iconElement = document.createElement("iconify-icon");
    iconElement.classList.add("bookmark-iconify");
    iconElement.icon = bookmark.iconify;
    iconElement.noobserver = true;
    if (bookmark.color) {
      iconElement.style.color = bookmark.color;
    }
    if (bookmark.size) {
      iconElement.style.fontSize = bookmark.size;
    }
  } else if (bookmark.icon) {
    iconElement = document.createElement("img");
    iconElement.classList.add("bookmark-icon");
    iconElement.loading = "lazy";
    iconElement.src = bookmark.icon;
    if (bookmark.size) {
      iconElement.style.height = bookmark.size;
      iconElement.style.width = bookmark.size;
    }
    if (bookmark.radius) {
      iconElement.style.borderRadius = bookmark.radius;
    }
  } else if (bookmark.iconText) {
    iconElement = document.createElement("div");
    iconElement.classList.add("bookmark-icon-text");
    iconElement.innerText = bookmark.iconText;
    if (bookmark.color) {
      iconElement.style.color = bookmark.color;
    }
    if (bookmark.size) {
      iconElement.style.fontSize = bookmark.size;
    }
    if (bookmark.fontWeight) {
      iconElement.style.fontWeight = bookmark.fontWeight;
    }
    if (bookmark.fontFamily) {
      iconElement.style.fontFamily = bookmark.fontFamily;
    }
  }

  backgroundElement.appendChild(iconElement);

  const nameElement = document.createElement("div");
  nameElement.classList.add("bookmark-name", "text-shadow");
  nameElement.innerText = bookmark.name;
  bookmarkElement.appendChild(nameElement);

  return bookmarkElement;
};

for (const [name, bookmarks] of Object.entries(data)) {
  createGroupElement(name, bookmarks);
}

document.getElementById("loader").style.display = "none";

window.addEventListener("load", () => {
  const isDesktop = "not screen and (hover: none) and (pointer: coarse)";
  if (window.matchMedia(isDesktop).matches) {
    searchElement.focus();
  }
});
