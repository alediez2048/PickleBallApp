import React from "react";
import renderer from "react-test-renderer";
import { TextInput } from "../TextInput";
import { View } from "react-native";

describe("<TextInput />", () => {
  it("renders correctly with basic props", () => {
    const tree = renderer
      .create(
        <TextInput
          label="Username"
          placeholder="Enter username"
          value=""
          onChangeText={() => {}}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with value", () => {
    const tree = renderer
      .create(
        <TextInput
          label="Username"
          placeholder="Enter username"
          value="johndoe"
          onChangeText={() => {}}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with error message", () => {
    const tree = renderer
      .create(
        <TextInput
          label="Username"
          placeholder="Enter username"
          value=""
          onChangeText={() => {}}
          error="This field is required"
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with helper text", () => {
    const tree = renderer
      .create(
        <TextInput
          label="Password"
          placeholder="Enter password"
          value=""
          onChangeText={() => {}}
          helperText="Must be at least 8 characters"
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly when disabled", () => {
    const tree = renderer
      .create(
        <TextInput
          label="Username"
          placeholder="Enter username"
          value="johndoe"
          onChangeText={() => {}}
          editable={false}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with start icon", () => {
    const tree = renderer
      .create(
        <TextInput
          label="Email"
          placeholder="Enter email"
          value=""
          onChangeText={() => {}}
          startIcon={<View testID="start-icon" />}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with end icon", () => {
    const tree = renderer
      .create(
        <TextInput
          label="Search"
          placeholder="Search..."
          value=""
          onChangeText={() => {}}
          endIcon={<View testID="end-icon" />}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with secure text entry", () => {
    const tree = renderer
      .create(
        <TextInput
          label="Password"
          placeholder="Enter password"
          value="password123"
          onChangeText={() => {}}
          secureTextEntry={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("forwards refs correctly", () => {
    const ref = React.createRef<any>();
    
    const tree = renderer
      .create(
        <TextInput
          ref={ref}
          label="Username"
          placeholder="Enter username"
          value=""
          onChangeText={() => {}}
        />
      )
      .toJSON();
      
    expect(tree).toMatchSnapshot();
    expect(ref.current).toBeDefined();
  });
});
