// import onRequestDone from "./xhr";
// import parseRequest from "./parse";
// import downloadVideo from './download';
// import observeDom from './observe';
// import Button from './button.html';

export default String.raw`const videoList = [];
onRequestDone(function (response) {
  const requestVideos = parseRequest(response);
  if (requestVideos.length) {
    debugger;
    videoList.push(...requestVideos);
  }
});

observeDom(function ({ $group, $image }) {
    // debugger
  const findVideo = videoList.find(function (video) {
    return $image.src.indexOf(video.photo) > -1;
  });
  const checkExtensionButton = $group.getAttribute(
    'data-twitter-video-downloader-extension'
  );
  if (findVideo && !checkExtensionButton) {
    $group.setAttribute('data-twitter-video-downloader-extension', 'true');
    const { width, height } = $group
      .querySelector('svg')
      .getBoundingClientRect();
    const Button = ${'`'}<div class="extension-button-container">
    <div class="extension-button-hover"></div>
    <svg class="download-icon" width="${'${width}'}" height="${'${height}'}" viewBox="0 0 24 24" aria-hidden="true">
    <g>
      <path
        d="M11.99 16l-5.7-5.7L7.7 8.88l3.29 3.3V2.59h2v9.59l3.3-3.3 1.41 1.42-5.71 5.7zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z">
      </path>
    </g>
    </svg>
    <svg class="loading-icon" viewBox="0 0 32 32" aria-hidden="true" width="${'${width}'}" height="${'${height}'}">
    <circle cx="16" cy="16" fill="none" r="14" stroke-width="4"></circle>
    <circle cx="16" cy="16" fill="none" r="14" stroke-width="4"></circle>
    </svg>
    <svg class="success-icon" viewBox="0 0 24 24" aria-hidden="true" width="${'${width}'}" height="${'${height}'}">
    <g>
      <path
        d="M9 20c-.264 0-.52-.104-.707-.293l-4.785-4.785c-.39-.39-.39-1.023 0-1.414s1.023-.39 1.414 0l3.946 3.945L18.075 4.41c.32-.45.94-.558 1.395-.24.45.318.56.942.24 1.394L9.817 19.577c-.17.24-.438.395-.732.42-.028.002-.057.003-.085.003z">
      </path>
    </g>
    </svg>
    </div>${'`'};
    const $button = document.createElement('button');
    $button.classList.add('extension-button');
    $button.setAttribute('role', 'button');
    $button.setAttribute('title', 'Download');
    $button.insertAdjacentHTML('beforeend', Button);
    $group.appendChild($button);
    $button.addEventListener('click', async function (event) {
      event.preventDefault();
      this.disabled = true;
      this.classList.add('loading');
      const mixedVideos = videoList
        .filter(function (v) {
          return v.entityId === findVideo.entityId;
        })
        .filter(function (value, index, self) {
          return (
            index ===
            self.findIndex(function (find) {
              return find.id === value.id;
            })
          );
        });
      for (const video of mixedVideos) {
        await downloadVideo(video.video, video.text);
      }
      this.classList.remove('loading');
      this.classList.add('success');
    });
  }
});

function onRequestDone(callback) {
  const xhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (_, requestUrl) {
    if (
      /(api\.)?twitter\.com\/(i\/api\/)?(2|graphql|1\.1)\//i.test(requestUrl)
    ) {
      const xhrSend = this.send;
      this.send = function () {
        const xhrStateChange = this.onreadystatechange;
        this.onreadystatechange = function () {
          const { readyState, responseText } = this;
          if (readyState === XMLHttpRequest.DONE && responseText) {
            
            try {
              callback(JSON.parse(responseText));
            } catch (e) {
              console.log(e);
            }
          }
          return xhrStateChange.apply(this, arguments);
        };
        return xhrSend.apply(this, arguments);
      };
    }
    return xhrOpen.apply(this, arguments);
  };
}

function parseRequest(response) {
  // tweet entites
  const entities = [...find(response, 'extended_entities')];

  // tweet card entites
  const cards = [...find(response, 'string_value')]
    .map(function (value) {
      try {
        const parsedValue = JSON.parse(value.string_value);
        const mediaEntity = Object.values(parsedValue.media_entities)
          .filter(function (media) {
            return ['video', 'animated_gif'].indexOf(media.type) > -1;
          })
          .shift();
        if (mediaEntity) {
          return {
            extended_entities: {
              media: [mediaEntity],
            },
            id_str: mediaEntity.id_str,
          };
        }
      } catch (e) {
        return false;
      }
      return false;
    })
    .filter(Boolean);

  return [...cards, ...entities]
    .filter(function (entity) {
      return entity.extended_entities.media.filter(checkMediaHasVideo).length;
    })
    .flatMap(function (entity) {
      const entityId = entity.id_str || entity.conversation_id_str;
      const {
        extended_entities: { media },
      } = entity;
      return media.filter(checkMediaHasVideo).map(function (item) {
        const video = item.video_info.variants
          .filter(function (variant) {
            return variant.content_type === 'video/mp4';
          })
          .sort(function (first, second) {
            return second.bitrate - first.bitrate;
          })
          .shift();
        return {
          id: item.id_str,
          entityId: entityId,
          photo: item.media_url_https.substr(
            0,
            item.media_url_https.lastIndexOf('.')
          ),
          video: video.url,
          text: textify(entity),
        };
      });
    })
    .filter(function (video, index, self) {
      return self.indexOf(video) === index;
    });
}

function find(source, key, list = []) {
  if (!source) {
    return list;
  }

  if (typeof source !== 'object') {
    return list;
  }

  if (typeof source[key] !== 'undefined') {
    list.push(source);
  } else {
    Object.values(source).forEach(function (deep) {
      list.push(...find(deep, key));
    });
  }

  return list;
}

function textify(entity) {
  const entityId = entity.id_str || entity.conversation_id_str;

  if (!entity.full_text) {
    return entityId;
  }

  let text = entity.full_text
    .split('https://t.co')[0]
    .trim()
    .replace(/(\r\n|\n|\r)/gm, '')
    .substr(0, 50);

  if (!text) {
    text = entityId;
  }

  return text;
}

function checkMediaHasVideo(media) {
  return media.type === 'video' || media.type === 'animated_gif';
}

async function downloadVideo(url, name) {
  window.ReactNativeWebView.postMessage(
    'download%'+url+'%'+name+' downloaded with TTrends by @Olamarvelcreate'
   )
}

function observeDom(callback) {
  // debugger
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function ($element) {
        if ($element instanceof HTMLElement === false) {
          return false;
        }
        if ($element.nodeName === 'IMG') {
          const $container = $element.closest("article[role='article']");
          if ($container) {
            const $group = $container.querySelector(
              "[role='group']:last-child"
            );
            if ($group) {
              callback({
                $image: $element,
                $group: $group,
              });
            }
          }
        }
      });
    });
  });
  observer.observe(document, { childList: true, subtree: true });
}

// window.addEventListener('load', 
function addcss() {
  // Create a style element
  var styleElement = document.createElement('style');
  
  // Set the CSS text content
  styleElement.textContent = ${'`'}
    [data-twitter-video-downloader-extension]{max-width:100% !important}[data-twitter-video-downloader-extension]>div{flex:auto}[data-twitter-video-downloader-extension] .extension-button{display:flex;align-items:center;cursor:pointer;margin:0;padding:0;border:none;background:none;order:1}[data-twitter-video-downloader-extension] .extension-button .extension-button-container{display:flex;position:relative}[data-twitter-video-downloader-extension] .extension-button .extension-button-container .extension-button-hover{margin:-8px;display:inline-flex;background-color:rgba(0,0,0,0);transition-property:background-color,box-shadow;transition-duration:.2s;position:absolute;top:0;right:0;bottom:0;left:0;border-radius:9999px}[data-twitter-video-downloader-extension] .extension-button .extension-button-container .extension-button-hover:hover{background-color:rgba(119,186,153,.2)}[data-twitter-video-downloader-extension] .extension-button .extension-button-container svg{fill:currentcolor;color:#77ba99}[data-twitter-video-downloader-extension] .extension-button .extension-button-container svg.loading-icon{display:none;animation-timing-function:linear;animation-name:spin;animation-iteration-count:infinite;animation-duration:.75s}[data-twitter-video-downloader-extension] .extension-button .extension-button-container svg.loading-icon circle{stroke:#77ba99}[data-twitter-video-downloader-extension] .extension-button .extension-button-container svg.loading-icon circle:first-child{opacity:.2}[data-twitter-video-downloader-extension] .extension-button .extension-button-container svg.loading-icon circle:nth-child(2){stroke-dasharray:80;stroke-dashoffset:60}[data-twitter-video-downloader-extension] .extension-button .extension-button-container svg.success-icon{display:none}[data-twitter-video-downloader-extension] .extension-button.loading svg.loading-icon{display:flex}[data-twitter-video-downloader-extension] .extension-button.loading svg.download-icon,[data-twitter-video-downloader-extension] .extension-button.loading svg.success-icon{display:none}[data-twitter-video-downloader-extension] .extension-button.success svg.loading-icon,[data-twitter-video-downloader-extension] .extension-button.success svg.download-icon{display:none}[data-twitter-video-downloader-extension] .extension-button.success svg.success-icon{display:flex}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
  ${'`'};

  // Append the style element to the head of the document
  document.head.appendChild(styleElement);
}
// );

addcss();

`;
