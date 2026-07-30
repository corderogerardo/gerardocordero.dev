import styled from 'styled-components'

const Header = () => {
  return (
    <header>
      <img src="" alt="logo" className="logo" />
    </header>
  )
}

export default styled(Header)`
  background: #524763;
  padding: 10px 5%;

  .logo{
    width: 60px
  }
`
