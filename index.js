module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Запрещает деструктуризацию пропсов в параметрах React-компонентов',
      recommended: false,
    },
    schema: [],
    fixable: 'code',
    messages: {
      noDestructure:
        'Не деструктурируй props в параметрах функции. Используй const { ... } = props внутри тела.',
    },
  },
  create(context) {
    function isReactComponent(node) {
      // 1) FunctionDeclaration c PascalCase
      if (
        node.type === 'FunctionDeclaration' &&
        node.id &&
        /^[A-Z]/.test(node.id.name)
      ) {
        return true
      }

      // 2) ArrowFunctionExpression в export default
      if (
        node.type === 'ArrowFunctionExpression' &&
        node.parent &&
        node.parent.type === 'ExportDefaultDeclaration'
      ) {
        return true
      }

      // 3) Const MyComp = (..) => {..}
      if (
        node.type === 'ArrowFunctionExpression' &&
        node.parent &&
        node.parent.type === 'VariableDeclarator' &&
        node.parent.id &&
        /^[A-Z]/.test(node.parent.id.name)
      ) {
        return true
      }

      return false
    }

    function checkParams(node) {
      if (!isReactComponent(node)) return

      if (node.params) {
        node.params.forEach((param) => {
          if (param.type === 'ObjectPattern') {
            context.report({
              node: param,
              messageId: 'noDestructure',
              fix(fixer) {
                const sourceCode = context.getSourceCode()
                const destructText = sourceCode.getText(param)

                // Пример: { a, b }
                // Фикс: заменить параметр на props
                // и добавить внутри тела: const { a, b } = props;
                const fixes = []

                fixes.push(fixer.replaceText(param, 'props'))

                // Вставляем деструктуризацию в начало тела
                if (node.body && node.body.type === 'BlockStatement') {
                  const firstToken = node.body.body[0]
                  const insertText = `const ${destructText} = props;\n`

                  if (firstToken) {
                    fixes.push(fixer.insertTextBefore(firstToken, insertText))
                  } else {
                    // Пустое тело
                    fixes.push(
                      fixer.insertTextAfterRange(
                        [node.body.range[0], node.body.range[0] + 1],
                        `\n${insertText}`
                      )
                    )
                  }
                }
                return fixes
              },
            })
          }
        })
      }
    }

    return {
      FunctionDeclaration: checkParams,
      ArrowFunctionExpression: checkParams,
    }
  },
}

