# Time of day service resource driver

A project to explore how to write a custom humanitec resource driver. The driver will register consumers to a **time of day** service implemented by the **fred** microservice.

We intend to explore the following:

- Starting a **fred** service if one is not available
- Allowing a client microservice - **ginger** - to declare a dependency on a time-of-day service using **score**
- How to **register** a custom resource driver with humanitec
- Observing the flow of PUT and DELETE calls to our custom resource driver
- Returning service location and credentials to the consuming microservice

The objective is to understand how to tackle internal and external cloud infrastructure resources with humanitec using a custom resource driver.

## Deploying

[Score](https://score.dev/) is used to deploy the workload to humanitec.

## The Workload

The workload is a nodejs REST app which implements the Humanitec [resource driver API](https://developer.humanitec.com/drivers/reference/api-spec/)
