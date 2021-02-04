import { LandingContainer } from './styles'
import { Button } from './../../Components/LevelUp/PassProps'
import ButtonRounded from './../../Components/Buttons/ButtonRounded';
import ButtonCancel from './../../Components/Buttons/ButtonCancel';

export default function Landing() {
  return (
    <LandingContainer>
      <Button types="save">Save</Button>

      <ButtonCancel>Cancel</ButtonCancel>

      <ButtonRounded> Hola Rounded </ButtonRounded>

    </LandingContainer>
  );
}
