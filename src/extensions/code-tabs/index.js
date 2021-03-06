import container from 'markdown-it-container';

const regExp = /codeTabs [\S ]+/;

const codeTabs = {
  validate(params) {
    return params.trim().match(regExp);
  },

  render(tokens, idx) {
    if (tokens[idx].nesting === 1) {
      const closeTab = tokens[idx].type.slice(0, -4) + 'close';
      const closeTabIndex = tokens.findIndex(
        (token, i) => i > idx && token.type === closeTab
      );

      tokens.slice(idx, closeTabIndex).forEach((token, i) => {
        token.attrs = [['data-index', i]];
      });

      const [, options] = tokens[idx].info.split('codeTabs');
      const [, ...titles] = options.split(' ');

      return `
        <CodeTabs>
          <div class="tabs is-boxed">
            <ul>
              ${titles
                .map(
                  (title, index) => `
                    <li
                      className=!{this.state.tabIndex === ${index} ? 'is-active' : undefined!}
                      onClick=!{this.onClick(${index})!}
                    >
                      <a>
                        <span>${title}</span>
                      </a>
                    </li>
                  `
                )
                .join('\n')}
            </ul>
          </div>
          <div class="">
            <div class="codeBlocks" style=!{!{ left: this.state.tabIndex * -100 + '%' !}!}>
      `;
    }

    return `
          </div>
        </div>
      </CodeTabs>
    `;
  }
};

export default function codeTabsPlugin(md) {
  md.use(container, 'codeTabs', codeTabs);
}
