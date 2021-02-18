import {render,screen, fireEvent, getByTestId} from '@testing-library/react'
import '@testing-library/jest-dom'

import * as React from 'react'
import Tagly from '../TagsComponent'


test('does something', () => {
    const testMessage = 'Test Message'

    const {getByTestId} = render(<Tagly/>)

    expect(getByTestId('xd')).toBeInTheDocument()

})
